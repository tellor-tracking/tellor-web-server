const utils = require('../utils');
const chai = require('chai');
const chaiHttp = require('chai-http');
const db = require('../../src/db');
const expect = chai.expect;

chai.use(chaiHttp);


describe('Api:Applications', () =>{

    let serverUri;
    let onAfter;

    before((done) => {
        utils.connectToDbAndServer(({_serverUri, _onAfter}) => {
            serverUri = _serverUri;
            onAfter = _onAfter;
            done();
        });


    });

    it('should create application', async () =>{
        const res =  await chai.request(serverUri).post('/api/applications').send({name: 'TestName', password: 'TestPassword'});
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');

        const apps = await db.getApplications();
        const app = apps.find(a => a.id === res.body.id);
        expect(app.name).to.equal(('TestName'));

        const isAuthValid = await db.authenticateApplication(res.body.id, 'TestPassword');
        expect(isAuthValid).to.be.true;
    });

    it('should fail to create application if no name is provided in payload', async () =>{
        try {
            await chai.request(serverUri).post('/api/applications').send({password: 'TestPassword'});
        } catch (e) {
            expect(e).to.have.status(422);
            expect(e.message).to.equal('Unprocessable Entity');
        }
    });

    it('should create application if no password is provided, using name for password', async () =>{
        const res =  await chai.request(serverUri).post('/api/applications').send({name: 'TestName'});
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');

        const apps = await db.getApplications();
        const app = apps.find(a => a.id === res.body.id);
        expect(app.name).to.equal(('TestName'));

        try {
            await db.authenticateApplication(res.body.id, 'TestPassword')
        } catch (e) {
            expect(e).to.be.an('error');
            expect(e.message).to.be.equal('Invalid password');
        }
    });

    it('should remove application if correct id and password is provided', async () =>{
        const {id: appId} = await db.registerApplication('TestName', 'TestPassword');
        const res =  await chai.request(serverUri).delete(`/api/applications/${appId}/remove`).send({password: 'TestPassword'});
        expect(res.body.id).to.equal(appId);
        expect(res.body.isRemoved).to.be.true;
    });

    it('should fail to remove application if incorrect id is provided', async () =>{
        await db.registerApplication('TestName', 'TestPassword');
        const res =  await chai.request(serverUri).delete(`/api/applications/wrong/remove`).send({password: 'TestPassword'});
        expect(res.body.id).to.equal('wrong');
        expect(res.body.isRemoved).to.be.false;
    });

    it('should fail to remove application if incorrect password is provided', async () =>{
        const {id: appId} = await db.registerApplication('TestName', 'TestPassword');
        const res =  await chai.request(serverUri).delete(`/api/applications/${appId}/remove`).send({password: 'TestWrong'});
        expect(res.body.id).to.equal(appId);
        expect(res.body.isRemoved).to.be.false;
    });

    it('should return list of applications', async () =>{
        const apps = await db.getApplications();
        expect(apps).to.be.an('array');
    });

    // FILTERS

    it('should add filter to applications filter list if correct appId and filterValue is provided', async () =>{
        const {id: appId} = await db.registerApplication('TestName', 'TestPassword');
        const res = await chai.request(serverUri).post(`/api/applications/${appId}/eventsFilters`)
            .send({eventFilter: {filterValue: 'ip=111.222.333'}});

        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('isSuccessful').that.equals(true);


        const apps = await db.getApplications();
        const app = apps.find(a => a.id === appId);

        expect(app.eventsFilters).to.have.length(1);
        expect(app.eventsFilters[0]).to.have.property('filterValue').that.equals('ip=111.222.333');
    });

    it('should not add filter if wrong app id is provided', async () =>{
        const {id: appId} = await db.registerApplication('TestName', 'TestPassword');
        try {

            await chai.request(serverUri).post(`/api/applications/wrongAppId/eventsFilters`)
                .send({eventFilter: {filterValue: 'ip=111.222.333'}});
        } catch (e) {
            expect(e).to.have.status(422);
            expect(e.message).to.be.equal('Unprocessable Entity');
            expect(e.response.body.message).to.be.equal('Invalid app id');

        }
    });

    it('should not add filter if invalid filter is provided', async () =>{
        const {id: appId} = await db.registerApplication('TestName', 'TestPassword');
        try {

            await chai.request(serverUri).post(`/api/applications/${appId}/eventsFilters`)
                .send({eventFilter: {filterValue: 'ip111.222.333'}});
            expect(1).to.equal(2); // should not be called
        } catch (e) {
            expect(e).to.have.status(422);
            expect(e.message).to.be.equal('Unprocessable Entity');
            expect(e.response.body.message).to.be.equal('Invalid filterValue');
        }
    });

    it('should delete filter if correct appId and filterId is provided', async () =>{
        const {id: appId} = await db.registerApplication('TestName', 'TestPassword');
        const {id: filterId1} = await db.addEventsFilter(appId, {filterValue: 'ip=123.345.33'});
        const {id: filterId2} = await db.addEventsFilter(appId, {filterValue: 'appVersion=2b'});

        const res1 = await chai.request(serverUri).delete(`/api/applications/${appId}/eventsFilters/${filterId1}`);
        const res2= await chai.request(serverUri).delete(`/api/applications/${appId}/eventsFilters/${filterId2}`);

        expect(res1.body).to.have.property('isSuccessful').that.equals(true);
        expect(res2.body).to.have.property('isSuccessful').that.equals(true);


        const apps = await db.getApplications();
        const app = apps.find(a => a.id === appId);

        expect(app.eventsFilters).to.have.length(0);
    });

    it('should fail to delete filter if incorrect appId is provided', async () =>{
        const {id: appId} = await db.registerApplication('TestName', 'TestPassword');
        const {id: filterId1} = await db.addEventsFilter(appId, {filterValue: 'ip=123.345.33'});

        try {
            await chai.request(serverUri).delete(`/api/applications/wrongAppId/eventsFilters/${filterId1}`);
            expect(1).to.equal(2); // should not be called
        } catch (e) {
            expect(e).to.have.status(422);
            expect(e.message).to.be.equal('Unprocessable Entity');
            expect(e.response.body.message).to.be.equal('Invalid app id');
        }

        const apps = await db.getApplications();
        const app = apps.find(a => a.id === appId);

        expect(app.eventsFilters).to.have.length(1);
    });

    it('should fail to delete filter if incorrect filterId is provided', async () =>{
        const {id: appId} = await db.registerApplication('TestName', 'TestPassword');
        const {id: filterId1} = await db.addEventsFilter(appId, {filterValue: 'ip=123.345.33'});

        try {
            await chai.request(serverUri).delete(`/api/applications/${appId}/eventsFilters/wrongFilterId`);
            expect(1).to.equal(2); // should not be called
        } catch (e) {
            expect(e).to.have.status(422);
            expect(e.message).to.be.equal('Unprocessable Entity');
            expect(e.response.body.message).to.be.equal('Invalid filter id');
        }

        const apps = await db.getApplications();
        const app = apps.find(a => a.id === appId);

        expect(app.eventsFilters).to.have.length(1);
        expect(app.eventsFilters[0]).to.have.property('id').that.equals(filterId1);
    });

    it('should remove all data related to filter when removing application (stats docs)', () =>{
        // TODO
    });

    after(done => onAfter(done));

});