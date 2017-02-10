const MongoClient = require('mongodb').MongoClient;
const {getFakeEvents} = require('../../../dev/lib');

const URL = `mongodb://localhost/testMongo`;

MongoClient.connect(URL, (err, db) => {
    if (err) {
        throw err;
    }
    console.log(`MongoDB connected! to ${URL}`);

    function insertFakeEventsToMongo(inserts) {
        function doInsert(insertsLeft) {
            const events = getFakeEvents(50000, 2, 5, 'test', ['123.345.1245', '12312123', '12321466'], ['1']);

            db.collection('events').insertMany(events, (err) => {
                if (err) {
                    console.log('Error', err);
                }

                console.log('Inserted batch successfully', insertsLeft);
                if (insertsLeft >= 1) {
                    doInsert(insertsLeft - 1);
                } else {
                    console.log('Done');
                    db.close()
                }
            })
        }

        doInsert(inserts);
    }

    function countEvents() {
        const startD = Date.now();
        db.collection('events').find().count((err, r) => {
            if (err) {
                console.log('Error', err);
            }

            console.log(`Count ${r}, q time ${Date.now() - startD}`);
        })
    }

    function testStream() {
        const stream = db.collection('events').find();
        let c = 0;

        stream.forEach((d) => {
            c++;
        });

        setInterval(() => console.log(c), 500);
    }

    testStream();
    // countEvents();
    // insertFakeEventsToMongo(100);
});
