const utils = require('../utils');
const chai = require('chai');
const chaiHttp = require('chai-http');
const db = require('../../src/db');
const expect = chai.expect;

chai.use(chaiHttp);


describe('Api:Events:Input', () =>{

    let serverUri;
    let onAfter;

    before((done) => {
        utils.connectToDbAndServer(({_serverUri, _onAfter}) => {
            serverUri = _serverUri;
            onAfter = _onAfter;
            done();
        });
    });

    it('should accept N amount of events in one call', () =>{

    });

    it('should always return 200', () =>{

    });

    it('should register event when all required fields are present', () =>{

    });

    it('should not register event when required fields are missing', () =>{

    });

    it('should add logged event to count stats', () =>{

    });

    it('should add logged event to segmentation stats', () =>{

    });

    it('should add logged event to count and segmentation stats by filters', () =>{

    });


    after(done => onAfter(done));

});