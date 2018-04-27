// FROM
// https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4#toc-want-more-mean-setting-up-a-mean-stack-single-page-application-build-a-restful-api-using-node-and-express-4-using-gruntjs-in-a-mean-stack-application-authenticate-a-node-api-with-tokens
// other helpful reference
// https://qiita.com/shopetan/items/58a62a366aac4f5faa20 -> https://github.com/shopetan/Sample-RESTful-jsonAPI

// server.js

//testing-testing-attention-please
console.log('networkInterfaces -> ', require('os').networkInterfaces() );


// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//2018-04-13 CORS copied from  github/brianalois/node_rest_api_mongo/app.js
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization, Content-Type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

var port = process.env.PORT || 6565;  //set our port
//var my_server_url = 'http://ocn.cloudns.org:6565';

// ADD MONGOOSE STUFF
// =============================================================================
var mongoose   = require('mongoose');
//var dev_db_url = 'mongodb://cooluser:coolpassword@ds115799.mlab.com:15799/ira';
var dev_db_url = 'mongodb://ocn.cloudns.org:6559';
//var dev_db_url = 'mongodb://cooluser:coolpassword@ds119748.mlab.com:19748/local_library'
//var dev_db_url = 'mongodb://node:node@novus.modulusmongo.net:27017/Iganiq8o'


mongoose.connect(dev_db_url); // connect to our database

var Bear     = require('./app/models/bear');
var Uza      = require('./app/models/uza');


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:6565/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// on routes that end in /bears
// ----------------------------------------------------
router.route('/bears')

    // create a bear (accessed at POST http://localhost:6565/api/bears)
    .post(function(req, res) {

        if( req.body.name == null ) {
            res.json({ message: 'A Bear has no name!' });
            return;
        }

        var bear = new Bear();      // create a new instance of the Bear model
        bear.name = req.body.name;  // set the bears name (comes from the request)

        // save the bear and check for errors
        bear.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'OK Bear created', bear : bear});
        });

    })
    
    // get all the bears (accessed at GET http://localhost:6565/api/bears)
    .get(function(req, res) {
        Bear.find(function(err, bears) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(bears);
        });
    });

// on routes that end in /uzas
// ----------------------------------------------------
router.route('/uzas')

    // create a uza (accessed at POST http://localhost:6565/api/uzas)
    .post(function(req, res) {
        if( req.body.name == null ) {
            res.json({ message: 'A Uza has no name!' });
            return;
        }

        //Uza.findOne({ 'name': req.body.name }, 'name name', function (err, uza) {
        Uza.findOne({ 'name': req.body.name }, '', function (err, uza) {
            if (err) {
                res.send(err);
                return;
            }

            if (uza !== null) {
                res.json({ message: 'OK User already exists', uza: uza});
                return;
            }
            // Prints "Space Ghost is a talk show host".
            console.log('Creating New User with name =', req.body.name);
            var uza = new Uza();        // create a new instance of the Uza model
            uza.name = req.body.name;   // set the uzas name (comes from the request)
            uza.bears = [];
            // save the uza and check for errors
            uza.save(function(err) {
                if (err) {
                    res.send(err);
                    return;
                }
                res.json({ message: 'OK User created', uza: uza });
            });
        });

    })    
    // get all the uzas (accessed at GET http://localhost:6565/api/uzas)
    .get(function(req, res) {
        Uza.find(function(err, uzas) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(uzas);
        });
    });

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/bears/:bear_id')

    // get the bear with that id (accessed at GET http://localhost:6565/api/bears/:bear_id)
    .get(function(req, res) {
        console.log('GET /bears/:bear_id req.params.bear_id =',req.params.bear_id, ', len =', req.params.bear_id.length)
        if(req.params.bear_id.length == 24) { // origuinal find by mongodb 24character _id
            Bear.findById(req.params.bear_id, function(err, bear) {
                if (err) {
                    console.log('Bear.findById: err =', err);
                    res.send(err);
                    return;
                }
                res.json({ message: 'OK', bear: bear} );
            });
        } else {
            // http://mongoosejs.com/docs/queries.html -> Bear.findOne
            // find each person with a last name matching req.params.bear_id, selecting the `name` and `offer` fields
            //Bear.findOne({ 'name': req.params.bear_id }, 'name offer', function (err, bear) {
            Bear.findOne({ 'name': req.params.bear_id }, '', function (err, bear) {
                if (err) {
                    console.log('Bear.findOne: err =', err);
                    res.send(err);
                    return;
                }

                if (bear == null) {
                    res.json({ message: 'NG Entry not found', id : req.params.bear_id});
                    return;
                }
                // Prints "Space Ghost is a talk show host".
                console.log('%s has offer %s.', bear.name, JSON.stringify(bear.offer) );
                res.json({ message: 'OK', bear: bear} );
            });
            /*
            Bear.find(function(err, bears) {
                if (err)
                    res.send(err);

                bears.forEach(element => {
                    if(element.name == req.params.bear_id){
                        res.json( { message: 'OK', bear: element} );
                        return;
                    }
                });

                res.json({ message: 'NG Entry not found', bear: null});

            });
            */
        }
    })

    // update the bear with this id (accessed at PUT http://localhost:6565/api/bears/:bear_id)
    .put(function(req, res) {

        // use our bear model to find the bear we want
        Bear.findById(req.params.bear_id, function(err, bear) {

            if (err) {
                res.send(err);
                return;
            }

            console.log('===============================================================');
            console.log('put - body = ', req.body)
            console.log('===============================================================');
            /*
            bear.name = req.body.name;  // update the bears info
            if(req.body.pig)
                bear.pig = req.body.pig;  // update the bears info
            */
           var _datems = Date.now();
           var _date = new Date(_datems);
           console.log('put - _date = ', _datems, '  ', _date)
           bear.timeStamp = _datems;
           bear.dateStamp = _date;
           if(req.body.offer)
               bear.offer = req.body.offer;
           if(req.body.tdid)
               bear.tdid = req.body.tdid;

            console.log('put - req.body.offer = ', req.body.offer)
            console.log('put -     bear.offer = ', bear.offer)
            console.log('===============================================================');
            console.log('put -           bear = ', bear)
            console.log('===============================================================');
                
            // save the bear
            bear.save(function(err) {
                if (err) {
                    console.log('put - bear.save error');
                    res.send(err);
                    return;
                }

                res.json({ message: 'OK Bear updated', bear: bear});
            });

        });
    })

    // delete the bear with this id (accessed at DELETE http://localhost:6565/api/bears/:bear_id)
    .delete(function(req, res) {
        Bear.remove({
            _id: req.params.bear_id
        }, function(err, bear) {
            if (err)
                res.send(err);

            res.json({ message: 'OK Successfully deleted' });
        });
    });

    

// on routes that end in /uzas/:uza_id
// ----------------------------------------------------
router.route('/uzas/:uza_id')

    // get the uza with that id (accessed at GET http://localhost:6565/api/uzas/:uza_id)
    .get(function(req, res) {
        console.log('GET /uzas/:uza_id req.params.uza_id =',req.params.uza_id, ', len =', req.params.uza_id.length)
        if(req.params.uza_id.length == 24) { // origuinal find by mongodb 24character _id
            Uza.findById(req.params.uza_id, function(err, uza) {
                if (err) {
                    console.log('Uza.findById: err =', err);
                    res.send(err);
                    return;
                }
                res.json({ message: 'OK', uza: uza} );
            });
        } else {
            // http://mongoosejs.com/docs/queries.html -> Uza.findOne
            // find each person with a last name matching req.params.uza_id, selecting the `name` and `bears` fields
            //Uza.findOne({ 'name': req.params.uza_id }, 'name bears', function (err, uza) {
            Uza.findOne({ 'name': req.params.uza_id }, '', function (err, uza) {
                if (err) {
                    console.log('Uza.findOne: err =', err);
                    res.send(err);
                    return;
                }

                if (uza == null) {
                    res.json({ message: 'NG Entry not found', id : req.params.uza_id});
                    return;
                }
                // Prints "Space Ghost is a talk show host".
                console.log('%s has bears %s.', uza.name, uza.bears);
                res.json({ message: 'OK', uza: uza} );
            });
            /*
            Uza.find(function(err, uzas) {
                if (err)
                    res.send(err);

                uzas.forEach(element => {
                    if(element.name == req.params.uza_id){
                        res.json(element);
                        return;
                    }
                });

                res.json({message: 'Can not find it Dude.'});

            });
            */
        }
    })

    // update the uza with this id (accessed at PUT http://localhost:6565/api/uzas/:uza_id)
    .put(function(req, res) {

        // use our uza model to find the uza we want
        Uza.findById(req.params.uza_id, function(err, uza) {

            if (err) {
                res.send(err);
                return;
            }

            console.log('===============================================================');
            console.log('put - body = ', req.body)
            console.log('===============================================================');
            /*
            uza.name = req.body.name;  // update the uzas info
            if(req.body.pig)
                uza.pig = req.body.pig;  // update the uzas info
            */
           var _datems = Date.now();
           var _date = new Date(_datems);
           console.log('put - _date = ', _datems, '  ', _date)
           uza.timeStamp = _datems;
           uza.dateStamp = _date;
           if(req.body.bears)
               uza.bears = req.body.bears;
           if(req.body.tdid)
               uza.tdid = req.body.tdid;

            console.log('put - req.body.bears = ', req.body.bears)
            console.log('put -      uza.bears = ', uza.bears)
            console.log('===============================================================');
            console.log('put -            uza = ', uza)
            console.log('===============================================================');
                
            // save the uza
            uza.save(function(err) {
                if (err) {
                    console.log('put - uza.save error');
                    res.send(err);
                    return;
                }

                res.json({ message: 'OK Uza updated', uza: uza});
            });

        });
    })

    // delete the uza with this id (accessed at DELETE http://localhost:6565/api/uzas/:uza_id)
    .delete(function(req, res) {
        console.log('GET /uzas/:uza_id req.params.uza_id =',req.params.uza_id, ', len =', req.params.uza_id.length)
        if(req.params.uza_id.length == 24) { // origuinal find by mongodb 24character _id
            Uza.findById(req.params.uza_id, function(err, uza) {
                if (err) {
                    res.send(err);
                    return;
                }
                //==========----- delete -----==========
                Uza.remove( { _id: uza._id }, function(err, uza) {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    res.json({ message: 'OK Successfully deleted' });
                });
                //==========----- delete -----==========
            });
        } else {
            // http://mongoosejs.com/docs/queries.html -> Uza.findOne
            // find each person with a last name matching req.params.uza_id, selecting the `name` and `bears` fields
            //Uza.findOne({ 'name': req.params.uza_id }, 'name bears', function (err, uza) {
            Uza.findOne({ 'name': req.params.uza_id }, '', function (err, uza) {
                if (err) {
                    res.send(err);
                    return;
                }

                if (uza == null) {
                    res.json({ message: 'Uza not found!', name : req.params.uza_id});
                    return;
                }
                // Prints "Space Ghost is a talk show host".
                console.log('%s has bears %s.', uza.name, uza.bears);

                //==========----- delete -----==========
                Uza.remove( { _id: uza._id }, function(err, uza) {
                    if (err) {
                        res.send(err);
                        return;
                    }
                    res.json({ message: 'OK Successfully deleted' });
                });
                //==========----- delete -----==========
            });
        }

    });


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

