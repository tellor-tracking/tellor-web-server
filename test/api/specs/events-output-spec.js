const chai = require('chai');
const chaiHttp = require('chai-http');
const db = require('../../../src/db/index');
const expect = chai.expect;
const moment = require('moment');
const {getFakeEvents, addFilters} = require('../../../dev/lib');

chai.use(chaiHttp);

const getFilter = (filters, filter, value) => filters.reduce((res, val) => {
    if (val.filterValue === `${filter}=${value}`) {
        return val.id;
    } else {
        return res;
    }
}, null);


describe('Api:Events:Output', function() {

    this.slow(500);

    let serverUri;
    let dbConnection;
    let appId;

    before(() => {
        serverUri = global.serverUri;
        dbConnection = db.getDb();
    });

    beforeEach(async () => {
        const r = await db.registerApplication('TestName', 'TestPassword');
        appId = r._id;
    });

    it('should return list of events with their segmentations', async () => {
        await db.insertTrackEvents(appId, getFakeEvents(10, 1, 5, appId), appId);
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

    it('should return stats with segmentation', async () => {
        await db.insertTrackEvents(appId, getFakeEvents(10, ['NameOne'], 5, appId));
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

    it('should returns stats by segmentation with stats interval: day', () => {
        // TODO
    });

    it('should returns stats by segmentation with stats interval: month', () => {
        // TODO
    });

    it('should filter stats by date', async () => {
        const today = moment.utc().format();
        const plusOneDays = moment.utc().add(1, 'days').format();
        const plusTwoDays = moment.utc().add(2, 'days').format();
        const plusOneYears = moment.utc().add(1, 'years').format();
        const minusOneDays = moment.utc().subtract(1, 'days').format();
        const minusTwoDays = moment.utc().subtract(2, 'days').format();
        const minusOneYears = moment.utc().subtract(1, 'years').format();

        await db.insertTrackEvents(appId, getFakeEvents(10, ['One'], [today], appId));
        await db.insertTrackEvents(appId, getFakeEvents(5, ['One'], [plusOneDays], appId));
        await db.insertTrackEvents(appId, getFakeEvents(10, ['One'], [plusTwoDays], appId));
        await db.insertTrackEvents(appId, getFakeEvents(77, ['One'], [plusOneYears], appId));
        await db.insertTrackEvents(appId, getFakeEvents(5, ['One'], [minusOneDays], appId));
        await db.insertTrackEvents(appId, getFakeEvents(10, ['One'], [minusTwoDays], appId));
        await db.insertTrackEvents(appId, getFakeEvents(56, ['One'], [minusOneYears], appId));

        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);
        const event = res.body[0];

        // make sure all events were registered
        const {body: stats1} = await chai.request(serverUri).get(`/api/events/${event._id}/stats`);
        expect(stats1.totalCount).to.equal(173);

        // make sure startDate works
        const {body: stats2} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?startDate=${today.split('T')[0]}`);
        expect(stats2.totalCount).to.equal(102);

        // make sure endDate works
        const {body: stats3} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?endDate=${minusTwoDays.split('T')[0]}`);
        expect(stats3.totalCount).to.equal(66);

        // make sure both together work
        const {body: stats4} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?startDate=${minusOneDays.split('T')[0]}&endDate=${plusOneDays.split('T')[0]}`);
        expect(stats4.totalCount).to.equal(20);
    });

    //TODO add check for segmentation counts too

    it('should filter stats by ip filter', async () => {
        let ips = [['1111.222.33'], ['2222.444.555']];

        await addFilters(db, appId, ips);

        await db.insertTrackEvents(appId, getFakeEvents(10, ['One'], 1, appId, ips[0]));
        await db.insertTrackEvents(appId, getFakeEvents(5, ['One'], 1, appId, ips[1]));

        const {body: {eventsFilters}} = await chai.request(serverUri).get(`/api/applications/${appId}`);

        const filterId0 = getFilter(eventsFilters, 'ip', ips[0][0]);
        const filterId1 = getFilter(eventsFilters, 'ip', ips[1][0]);

        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);
        const event = res.body[0];

        // make sure all events were registered
        const {body: stats1} = await chai.request(serverUri).get(`/api/events/${event._id}/stats`);
        expect(stats1.totalCount).to.equal(15);

        // make sure filter 0 works
        const {body: stats2} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?filters=${filterId0}`);
        expect(stats2.totalCount).to.equal(10);

        // make sure filter 1 works
        const {body: stats3} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?filters=${filterId1}`);
        expect(stats3.totalCount).to.equal(5);
    });

    it('should filter stats by appVersion filter', async () => {
        let appVersions = [['1'], ['2a']];

        await addFilters(db, appId, [], appVersions);

        await db.insertTrackEvents(appId, getFakeEvents(10, ['One'], 1, appId, [1], appVersions[0]));
        await db.insertTrackEvents(appId, getFakeEvents(5, ['One'], 1, appId, [1], appVersions[1]));

        const {body: {eventsFilters}} = await chai.request(serverUri).get(`/api/applications/${appId}`);

        const filterId0 = getFilter(eventsFilters, 'appVersion', appVersions[0][0]);
        const filterId1 = getFilter(eventsFilters, 'appVersion', appVersions[1][0]);

        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);
        const event = res.body[0];

        // make sure all events were registered
        const {body: stats1} = await chai.request(serverUri).get(`/api/events/${event._id}/stats`);
        expect(stats1.totalCount).to.equal(15);

        // make sure filter 0 works
        const {body: stats2} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?filters=${filterId0}`);
        expect(stats2.totalCount).to.equal(10);

        // make sure filter 1 works
        const {body: stats3} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?filters=${filterId1}`);
        expect(stats3.totalCount).to.equal(5);
    });

    it('should filter stats by combined query of both ip and appVersion filters', async () => {
        let ips = [['1111.222.33'], ['2222.444.555']];
        let appVersions = [['1'], ['2a']];

        await addFilters(db, appId, ips, appVersions);

        await db.insertTrackEvents(appId, getFakeEvents(10, ['One'], 1, appId, ips[0], appVersions[0])); // pair 1
        await db.insertTrackEvents(appId, getFakeEvents(5, ['One'], 1, appId, ips[0], appVersions[1])); // pair 2
        await db.insertTrackEvents(appId, getFakeEvents(7, ['One'], 1, appId, ips[1]));
        await db.insertTrackEvents(appId, getFakeEvents(9, ['One'], 1, appId, [1], appVersions[0]));

        const {body: {eventsFilters}} = await chai.request(serverUri).get(`/api/applications/${appId}`);

        const ipFilterId0 = getFilter(eventsFilters, 'ip', ips[0][0]);
        const ipFilterId1 = getFilter(eventsFilters, 'ip', ips[1][0]);
        const appVersionFilterId0 = getFilter(eventsFilters, 'appVersion', appVersions[0][0]);
        const appVersionFilterId1 = getFilter(eventsFilters, 'appVersion', appVersions[1][0]);

        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);
        const event = res.body[0];

        // make sure all events were registered
        const {body: stats1} = await chai.request(serverUri).get(`/api/events/${event._id}/stats`);
        expect(stats1.totalCount).to.equal(31);

        // pair 1 test
        const {body: stats2} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?filters=${ipFilterId0},${appVersionFilterId0}`);
        expect(stats2.totalCount).to.equal(10);

        // pair 2 test
        const {body: stats3} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?filters=${ipFilterId0},${appVersionFilterId1}`);
        expect(stats3.totalCount).to.equal(5);

        // no match test
        const {body: stats4} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?filters=${ipFilterId1},${appVersionFilterId1}`);
        expect(stats4.totalCount).to.equal(0);
    });

    it('filter should be ordered by: ipFilter, appFilter', async () => {
        let ips = [['1111.222.33'], ['2222.444.555']];
        let appVersions = [['1'], ['2a']];

        await addFilters(db, appId, ips, appVersions);

        await db.insertTrackEvents(appId, getFakeEvents(10, ['One'], 1, appId, ips[0], appVersions[0])); // pair 1
        await db.insertTrackEvents(appId, getFakeEvents(5, ['One'], 1, appId, ips[0], appVersions[1])); // pair 2
        await db.insertTrackEvents(appId, getFakeEvents(7, ['One'], 1, appId, ips[1]));
        await db.insertTrackEvents(appId, getFakeEvents(9, ['One'], 1, appId, [1], appVersions[0]));

        const {body: {eventsFilters}} = await chai.request(serverUri).get(`/api/applications/${appId}`);

        const ipFilterId0 = getFilter(eventsFilters, 'ip', ips[0][0]);
        const appVersionFilterId0 = getFilter(eventsFilters, 'appVersion', appVersions[0][0]);

        const res = await chai.request(serverUri).get(`/api/applications/${appId}/events`);
        const event = res.body[0];

        // correct order
        const {body: stats2} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?filters=${ipFilterId0},${appVersionFilterId0}`);
        expect(stats2.totalCount).to.equal(10);

        // incorrect order
        const {body: stats3} = await chai.request(serverUri).get(`/api/events/${event._id}/stats?filters=${appVersionFilterId0},${ipFilterId0}`);
        expect(stats3.totalCount).to.equal(0);
    });
});