const chai = require('chai');
const chaiHttp = require('chai-http');
const db = require('../../../src/db/index');
const utils = require('../../utils');
const expect = chai.expect;

chai.use(chaiHttp);


describe('Api:Events:Input', function() {

    this.slow(500);

    let serverUri;
    let appId;

    before(() => {
        serverUri = global.serverUri;
    });

    beforeEach(async () => {
        const r = await db.registerApplication('TestName', 'TestPassword');
        appId = r.id;
    });

    it('should accept N amount of events in one call', async () =>{
        await chai.request(serverUri)
            .get(`/track?app_key=${appId}&app_version=1&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {seg: 'abc'}}, {name: 'TestTwo'}])}`);

        await utils.sleep(200);

        const events = await db.getEvents(appId);
        expect(events).to.have.length(2);
    });

    it('should register event when all required fields are present', async () =>{
        const res = await chai.request(serverUri)
            .get(`/track?app_key=${appId}&app_version=1&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {seg: 'abc'}}])}`);

        expect(res).to.have.status(200);

        await utils.sleep(100);

        const events = await db.getEvents(appId);
        expect(events).to.have.length(1);
        expect(events[0]).to.have.property('name').that.equals('Test');
        expect(events[0].segmentation).to.include('seg');
    });

    it('should not register event when required fields are missing', async () =>{
        const res = await chai.request(serverUri)
            .get(`/track?&app_version=1&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {seg: 'abc'}}])}`);

        expect(res).to.have.status(200);

        await utils.sleep(100);

        const events = await db.getEvents(appId);
        expect(events).to.have.length(0);
    });

    it('should add logged event to count stats', async () =>{
        await chai.request(serverUri).get(`/track?app_key=${appId}&app_version=1&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {seg: 'abc'}}])}`);
        await chai.request(serverUri).get(`/track?app_key=${appId}&app_version=1&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {seg: 'abc'}}])}`);

        await utils.sleep(100);

        const events = await db.getEvents(appId);
        const eventId = events[0]._id;

        const stats = await db.getEventStats(eventId);
        expect(stats.totalCount).to.equal(2);
    });

    it('should add logged event to segmentation stats', async () =>{
        await chai.request(serverUri).get(`/track?app_key=${appId}&app_version=1&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {isNice: 'yes'}}])}`);
        await chai.request(serverUri).get(`/track?app_key=${appId}&app_version=1&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {isNice: 'yes'}}])}`);
        await chai.request(serverUri).get(`/track?app_key=${appId}&app_version=1&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {isNice: 'no'}}])}`);

        await utils.sleep(100);

        const events = await db.getEvents(appId);
        const eventId = events[0]._id;

        const stats = await db.getEventStats(eventId);
        expect(stats.segmentation.isNice[0]).to.have.property('yes').that.equals(2);
        expect(stats.segmentation.isNice[0]).to.have.property('no').that.equals(1);
    });

    it('should add logged event to count and segmentation stats by filters', async () =>{
        const {id: filterId} = await db.addEventsFilter(appId, {filterValue: 'appVersion=3a'});

        await chai.request(serverUri).get(`/track?app_key=${appId}&app_version=3a&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {isNice: 'yes'}}])}`);
        await chai.request(serverUri).get(`/track?app_key=${appId}&app_version=3a&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {isNice: 'yes'}}])}`);
        await chai.request(serverUri).get(`/track?app_key=${appId}&app_version=3a&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {isNice: 'no'}}])}`);
        await chai.request(serverUri).get(`/track?app_key=${appId}&app_version=1&sdk=web&events=${JSON.stringify([{name: 'Test', segmentation: {isNice: 'no'}}])}`);

        await utils.sleep(100);

        const events = await db.getEvents(appId);
        const eventId = events[0]._id;

        const stats = await db.getEventStats(eventId, {filters: filterId});
        expect(stats.segmentation.isNice[0]).to.have.property('yes').that.equals(2);
        expect(stats.segmentation.isNice[0]).to.have.property('no').that.equals(1);
    });


    it('should add logged event to count and segmentation stats by multiple filters', async () =>{
        // TODO
    });

});