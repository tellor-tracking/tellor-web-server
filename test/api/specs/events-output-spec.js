const chai = require('chai');
const chaiHttp = require('chai-http');
const db = require('../../../src/db/index');
const expect = chai.expect;

chai.use(chaiHttp);


describe('Api:Events:Input', () =>{

    let serverUri;

    before(() => {
        serverUri = global.serverUri;
    });

    it('should return list of events with their segmentations', () =>{

    });

    it('should return stats with segmentation for event id', () =>{

    });

    it('should filter stats by date', () =>{

    });

    it('should filter stats by filters', () =>{

    });

});