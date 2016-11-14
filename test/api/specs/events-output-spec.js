const chai = require('chai');
const chaiHttp = require('chai-http');
const db = require('../../../src/db/index');
const expect = chai.expect;
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
        await db.insertTrackEvents(getFakeEvents(10, 2, 5, appId, ips, appVersions));
    });

    it('should return list of events with their segmentations', async () => {


    });

    it('should return stats with segmentation for event id', async () => {

    });

    it('should filter stats by date', async () => {

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