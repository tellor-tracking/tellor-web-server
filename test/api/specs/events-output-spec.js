const chai = require('chai');
const chaiHttp = require('chai-http');
const db = require('../../../src/db/index');
const expect = chai.expect;
const moment = require('moment');
const utils = require('../../utils');
const {getFakeEvents, addFilters} = require('../../../dev/lib');

chai.use(chaiHttp);


describe.only('Api:Events:Output', () => {

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
        const r = await db.registerApplication('TestName' + Math.random(), 'TestPassword');
        appId = r.id;

        await addFilters(db, appId, ips, appVersions);
    });

    it('should return list of events with their segmentations', async () => {
        await db.insertTrackEvents(getFakeEvents(10, 1, 5, appId, ips, appVersions), appId);
        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);

        expect(res.body).to.be.an.array;
        res.body.forEach(ev => {
            expect(ev).to.have.property('name');
            expect(ev).to.have.property('meta').that.is.an.array;
            expect(ev).to.have.property('_id');
            expect(ev).to.have.property('appId');
            expect(ev).to.have.property('segmentation').that.is.an.array;
        });
    });

    it('should return empty array if appId is invalid', async () => {
        const res = await chai.request(serverUri).get(`/api/applications/invalidAppId/events`);

        expect(res.body).to.be.instanceOf(Array).that.has.length(0);
    });

    it('should return empty array if app has no events is invalid', async () => {
        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);

        expect(res.body).to.be.instanceOf(Array).that.has.length(0);
    });

    it('should return stats with segmentation for event id', async () => {
        await db.insertTrackEvents(getFakeEvents(10, ['NameOne'], 5, appId, ips, appVersions), appId);
        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);
        const event = res.body[0];
        const eventStats = await chai.request(serverUri).get(`/api/events/${event._id}/stats`);

        expect(event.name).to.equal('NameOne');
        expect(eventStats.body).to.have.property('name').that.equals(event.name);
        expect(eventStats.body).to.have.property('appId').that.equals(appId);
        expect(eventStats.body).to.have.property('id').that.equals(`${event._id}:filters:none`);

        expect(eventStats.body).to.have.property('count');
        expect(eventStats.body).to.have.property('totalCount').that.equals(10);
        expect(eventStats.body.count[0]).to.have.property('date');
        expect(eventStats.body.count[0]).to.have.property('count');

        expect(eventStats.body).to.have.property('segmentation');
        event.segmentation.forEach(s => expect(eventStats.body.segmentation).to.have.property(s));
    });

    it('should filter stats by date', async () => {
        const today = moment().format();
        const plusOneDays = moment().add(1, 'days').format();
        const plusTwoDays = moment().add(2, 'days').format();
        const minusOneDays = moment().subtract(1, 'days').format();
        const minusTwoDays = moment().subtract(2, 'days').format();

        await db.insertTrackEvents(getFakeEvents(10, ['One'], [today], appId, ips, appVersions));
        await db.insertTrackEvents(getFakeEvents(5, ['One'], [plusOneDays], appId, ips, appVersions));
        await db.insertTrackEvents(getFakeEvents(10, ['One'], [plusTwoDays], appId, ips, appVersions));
        await db.insertTrackEvents(getFakeEvents(5, ['One'], [minusOneDays], appId, ips, appVersions));
        await db.insertTrackEvents(getFakeEvents(10, ['One'], [minusTwoDays], appId, ips, appVersions));

        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);
        const event = res.body[0];

        // make sure all events were registered
        const {body: stats1} = await chai.request(serverUri).get(`/api/events/${event._id}/stats`);
        expect(stats1.totalCount).to.equal(40);

        // make sure startDate works
        const {body: stats2} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?startDate=${today.split('T')[0]}`);
        expect(stats2.totalCount).to.equal(25);

        // make sure endDate works
        const {body: stats3} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?endDate=${minusTwoDays.split('T')[0]}`);
        expect(stats3.totalCount).to.equal(10);

        // make sure both together work
        const {body: stats4} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?startDate=${minusOneDays.split('T')[0]}&endDate=${plusOneDays.split('T')[0]}`);
        expect(stats4.totalCount).to.equal(20);
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