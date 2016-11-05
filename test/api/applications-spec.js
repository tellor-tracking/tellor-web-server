const chai = require('chai');
const chaiHttp = require('chai-http');
const startServer = require('../../src/server');
const db = require('../../src/db');
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

    it('should create application', () =>{
        
    });

    it('should fail to create application if no name is provided in payload', () =>{

    });

    it('should create application if no password is provided, using name for password', () =>{

    });

    it('should remove application if correct id and password is provided', () =>{

    });

    it('should fail to remove application if incorrect id is provided', () =>{

    });

    it('should fail to remove application if incorrect password is provided', () =>{

    });

    it('should return list of applications', () =>{

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