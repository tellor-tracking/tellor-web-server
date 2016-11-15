const chai = require('chai');
const chaiHttp = require('chai-http');
const db = require('../../../src/db/index');
const expect = chai.expect;
const moment = require('moment');
const utils = require('../../utils');
const {getFakeEvents, addFilters} = require('../../../dev/lib');

chai.use(chaiHttp);


describe('Api:Events:Output', () => {

    let ips = ['1111.222.33', '2222.444.555'];
    let appVersions = ['1', '2.2'];

    let serverUri;
    let dbConnection;
    let appId;

    before(() => {
        serverUri = global.serverUri;
        dbConnection = db.getDb();
    });
    beforeEach(async () => {
        const r = await db.registerApplication('TestName', 'TestPassword');
        appId = r.id;

        await addFilters(db, appId, ips, appVersions);
    });

    it('should return list of events with their segmentations', async () => {
        await db.insertTrackEvents(getFakeEvents(10, 2, 5, appId, ips, appVersions), appId);
        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an.array;
        res.body.forEach(ev => {
            expect(ev).to.have.property('name');
            expect(ev).to.have.property('meta').that.is.an.array;
            expect(ev).to.have.property('id');
            expect(ev).to.have.property('appId');
            expect(ev).to.have.property('segmentation').that.is.an.array;
        });
    });

    it('should return error 4xx if appId is invalid', () => {

    });

    it('should return stats with segmentation for event id', async () => {
        await db.insertTrackEvents(getFakeEvents(10, 2, 5, appId, ips, appVersions), appId);
        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);
        const event = res.body[0];
        const eventStats = await chai.request(serverUri).get(`/api/events/${event.id}/stats`);
        expect(eventStats).to.have.status(200);

        expect(eventStats.body).to.have.property('appId').that.equals(appId);
        expect(eventStats.body).to.have.property('name').that.equals(event.name);
        expect(eventStats.body).to.have.property('id').that.equals(`${event.id}:filters:none`);

        expect(eventStats.body).to.have.property('count');
        expect(eventStats.body).to.have.property('totalCount');
        expect(eventStats.body.count[0]).to.have.property('date');
        expect(eventStats.body.count[0]).to.have.property('count');

        expect(eventStats.body).to.have.property('segmentation');
        event.segmentation.forEach(s => expect(eventStats.body.segmentation).to.have.property(s));
    });

    it('should filter stats by date', async () => {
        const today = moment().format();
        const plusTwoDays = moment().add(2, 'days').format();
        const minusTwoDays = moment().subtract(2, 'days').format();

        await db.insertTrackEvents(getFakeEvents(10, 1, [today], appId, ips, appVersions));
        // await db.insertTrackEvents(b);
        // await db.insertTrackEvents(c);
        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);

        // add some events at some date, some ant other query it
    });

    it('should filter stats by filters', async () => {

    });

    it('filter should be ordered by: ipFilter, appFilter', async () => {

    });

    it('filters cannot be ordered by different than: ipFilter, appFilter', async () => {

    });

    it('should support ipFilter and appFilter combined query', async () => {

    });

});