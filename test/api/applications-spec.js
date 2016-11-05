const chai = require('chai');
const chaiHttp = require('chai-http');
const startServer = require('../../src/server');
const db = require('../../src/db');
const expect = chai.expect;

chai.use(chaiHttp);



describe('Api:Applications', () =>{

    let dbConnection;
    let server;
    let serverUri;

    before(done => {
        db.connect(connection => {
            dbConnection = connection;
            startServer(serv => {
                server = serv;
                serverUri = serv.info.uri;
                done();
            })
        });
    });

    it('should create application', async () =>{
        const res =  await chai.request(serverUri).post('/api/applications').send({name: 'TestName', password: 'TestPassword'});
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('id');

        const apps = await db.getApplications();
        const app = apps.find(a => a.id === res.body.id);
        expect(app.name).to.equal(('TestName'));

        const isAuthValid = await db.authenticateApplication(res.body.id, 'TestPassword')
        expect(isAuthValid).to.be.true;
    });

    it('should fail to create application if no name is provided in payload', async () =>{
        try {
            await chai.request(serverUri).post('/api/applications').send({password: 'TestPassword'});
        } catch (e) {
            expect(e).to.have.status(422);
            expect(e.message).to.have.equal('Unprocessable Entity');
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

    it('should add filter to applications filter list if correct appId and filterValue is provided', () =>{

    });

    it('should not add filter if wrong app id is provided', () =>{

    });

    it('should not add filter if invalid filter is provided', () =>{

    });

    it('should delete filter if correct appId and filterId is provided', () =>{

    });

    it('should fail to delete filter if incorrect appId is provided', () =>{

    });

    it('should fail to delete filter if incorrect filterId is provided', () =>{

    });

    after(done => {
        dbConnection.close(() => {
            server.stop(done);
        });
    })

});