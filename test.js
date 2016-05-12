/*jslint
    bitwise: true,
    browser: true,
    maxerr: 8,
    maxlen: 96,
    node: true,
    nomen: true,
    regexp: true,
    stupid: true
*/
(function () {
    'use strict';
    var local;



    // run shared js-env code - pre-init
    (function () {
        // init local
        local = {};
        // init modeJs
        local.modeJs = (function () {
            try {
                return typeof navigator.userAgent === 'string' &&
                    typeof document.querySelector('body') === 'object' &&
                    typeof XMLHttpRequest.prototype.open === 'function' &&
                    'browser';
            } catch (errorCaughtBrowser) {
                return module.exports &&
                    typeof process.versions.node === 'string' &&
                    typeof require('http').createServer === 'function' &&
                    'node';
            }
        }());
        // init global
        local.global = local.modeJs === 'browser'
            ? window
            : global;
        switch (local.modeJs) {
        // re-init local from window.local
        case 'browser':
            local = window.local;
            break;
        // re-init local from example.js
        case 'node':
            local = require('utility2').local;
            local._script = local.fs.readFileSync(__dirname + '/README.md', 'utf8')
                // support syntax-highlighting
                .replace((/[\S\s]+?\n.*?example.js\s*?```\w*?\n/), function (match0) {
                    // preserve lineno
                    return match0.replace((/.+/g), '');
                })
                .replace((/\n```[\S\s]+/), '')
                // alias require('$npm_package_name') to require('index.js');
                .replace(
                    "require('" + process.env.npm_package_name + "')",
                    "require('./index.js')"
                );
            // jslint example.js
            local.utility2.jslintAndPrint(local._script, __dirname + '/example.js');
            // cover example.js
            local._script = local.utility2.istanbulInstrumentInPackage(
                local._script,
                __dirname + '/example.js',
                'swagger-lite'
            );
            local.global.assetsExampleJs = local._script;
            // require example.js
            local = local.utility2.requireFromScript(__dirname + '/example.js', local._script);
            break;
        }
    }());



    // run shared js-env code - function
    (function () {
        // init tests
        local.testCase_ajax_error = function (options, onError) {
        /*
         * this function will test ajax's error handling-behavior
         */
            var onParallel;
            // jslint-hack
            local.utility2.nop(options);
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            [{
                method: 'POST',
                // test 400 param-parse-error handling-behavior
                statusCode: 400,
                url: '/api/v0/_test/paramDefault/aa?paramJson=syntax%20error'
            }, {
                // test 404 undefined-api-error-1 handling-behavior
                statusCode: 404,
                url: '/api/v0/_test/errorUndefined'
            }, {
                // test 404 undefined-api-error-2 handling-behavior
                statusCode: 404,
                url: '/api/v0/_test/errorUndefinedApi'
            }, {
                // test 404 undefined-map-file handling-behavior
                statusCode: 404,
                url: '/api/v0/_test/undefined.map'
            }].forEach(function (options) {
                onParallel.counter += 1;
                local.utility2.ajax(options, function (error, xhr) {
                    local.utility2.tryCatchOnError(function () {
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(
                            error.statusCode,
                            options.statusCode
                        );
                        // validate error is in jsonapi-format
                        if (options.url !== '/api/v0/_test/undefined.map') {
                            error = JSON.parse(xhr.responseText);
                            local.utility2.assert(error.errors[0], error);
                        }
                        onParallel();
                    }, onError);
                });
            });
            onParallel();
        };

        local.testCase_crudCountManyByQuery_default = function (options, onError) {
        /*
         * this function will test crudCountManyByQuery's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            crudCountManyByQuery:
                                local.swgg.apiDict['_test crudCountManyByQuery'],
                            operationId: 'undefined.id',
                            keyValue: '00_test_crudCountManyByQuery'
                        });
                        local.swgg.keyUniqueInit(options);
                        // ajax - crudCountManyByQuery
                        options.crudCountManyByQuery({
                            paramDict: { _queryQuery: JSON.stringify(options.queryByKeyUnique) }
                        }, onNext);
                        break;
                    case 2:
                        // validate data
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 1);
                        local.utility2.assert(data.responseJson.data[0] ===
                            1, data.responseJson);
                        onNext();
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudCreateReplaceUpdateDeleteMany_default = function (options, onError) {
        /*
         * this function will test crudCreateReplaceUpdateDeleteMany's default handling-behavior
         */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            [{
                crudUpdateOneByKeyUnique:
                    local.swgg.apiDict['_test crudUpdateOneByKeyUnique.id'],
                data: {}
            }, {
                crudCreateOrReplaceOneByKeyUnique: local.swgg.apiDict['pet addPet'],
                crudDeleteOneByKeyUnique: local.swgg.apiDict['pet deletePet'],
                crudGetOneByKeyUnique: local.swgg.apiDict['pet getPetById'],
                crudUpdateOneByKeyUnique: local.swgg.apiDict['pet updatePetWithForm'],
                data: { name: 'name', photoUrls: ['photoUrls'] },
                dataValidateReplace: { name: 'name', status: 'available' },
                dataValidateUpdate1: { name: 'name', status: 'available' },
                dataValidateUpdate2: { status: 'pending' },
                operationId: 'undefined.petId.id'
            }, {
                crudCreateOrReplaceOneByKeyUnique: local.swgg.apiDict['store placeOrder'],
                crudDeleteOneByKeyUnique: local.swgg.apiDict['store deleteOrder'],
                crudGetOneByKeyUnique: local.swgg.apiDict['store getOrderById'],
                crudUpdateOneByKeyUnique:
                    local.swgg.apiDict['store crudUpdateOneByKeyUnique.id'],
                data: { id: 10 },
                dataValidateReplace: { petId: 10, status: 'placed' },
                dataValidateUpdate1: { petId: 10, status: 'placed' },
                dataValidateUpdate2: { status: 'approved' },
                operationId: 'undefined.orderId.id'
            }, {
                crudCreateOrReplaceOneByKeyUnique: local.swgg.apiDict['user createUser'],
                crudDeleteOneByKeyUnique: local.swgg.apiDict['user deleteUser'],
                crudGetOneByKeyUnique: local.swgg.apiDict['user getUserByName'],
                crudUpdateOneByKeyUnique: local.swgg.apiDict['user updateUser'],
                data: { username: '00_test_crudCreateReplaceUpdateDeleteMany' },
                dataValidateReplace: { firstName: 'firstName', userStatus: 1 },
                dataValidateUpdate1: { firstName: 'firstName', userStatus: 1 },
                dataValidateUpdate2: { userStatus: 2 },
                operationId: 'undefined.username'
            }].forEach(function (_) {
                options = _;
                onParallel.counter += 1;
                // test crudCreateReplaceUpdateDeleteOne's default handling-behavior
                local.testCase_crudCreateReplaceUpdateDeleteOne_default(options, onParallel);
            });
            onParallel();
        };

        local.testCase_crudCreateReplaceUpdateDeleteOne_default = function (options, onError) {
        /*
         * this function will test crudCreateReplaceUpdateDeleteOne's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            data: {},
                            operationId: 'undefined.id'
                        });
                        // test crudCreateOrReplaceOneByKeyUnique's create handling-behavior
                        local.testCase_crudCreateOrReplaceOneByKeyUnique_default(
                            options,
                            onNext
                        );
                        break;
                    case 2:
                        // test crudCreateOrReplaceOneByKeyUnique's replace handling-behavior
                        local.testCase_crudCreateOrReplaceOneByKeyUnique_default(
                            options,
                            onNext
                        );
                        break;
                    case 3:
                        // test crudUpdateOneByKeyUnique's default handling-behavior
                        local.testCase_crudUpdateOneByKeyUnique_default(
                            options,
                            onNext
                        );
                        break;
                    case 4:
                        // test crudDeleteOneByKeyUnique's default handling-behavior
                        local.testCase_crudDeleteOneByKeyUnique_default(options, onNext);
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudCreateOrReplaceMany_default = function (options, onError) {
        /*
         * this function will test crudCreateOrReplaceMany's default handling-behavior
         */
            var modeNext, onNext, onParallel;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = {
                            crudCreateOrReplaceMany:
                                local.swgg.apiDict['_test crudCreateOrReplaceMany'],
                            data: [{
                                id: '00_test_crudCreateOrReplaceMany_01',
                                propRequired: true
                            }, {
                                id: '00_test_crudCreateOrReplaceMany_02',
                                propRequired: true
                            }]
                        };
                        // ajax - crudCreateOrReplaceMany
                        options.crudCreateOrReplaceMany({ paramDict: {
                            body: options.data
                        } }, onNext);
                        break;
                    case 2:
                        onParallel = local.utility2.onParallel(onNext);
                        onParallel.counter += 1;
                        options.data.forEach(function (element) {
                            onParallel.counter += 1;
                            // test crudGetOneByKeyUnique's default handling-behavior
                            local.testCase_crudGetOneByKeyUnique_default({
                                keyValue: element.id
                            }, onParallel);
                        });
                        onParallel();
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudCreateOrReplaceOneByKeyUnique_default = function (options, onError) {
        /*
         * this function will test crudCreateOrReplaceOneByKeyUnique's default handling-behavior
         */
            var modeNext, onNext, paramDict;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            crudCreateOrReplaceOneByKeyUnique:
                                local.swgg.apiDict[
                                    '_test crudCreateOrReplaceOneByKeyUnique.id'
                                ],
                            data: {
                                // test dataReadonlyRemove handling-behavior
                                createdAt: '1970-01-01T00:00:00.000Z',
                                updatedAt: '1970-01-01T00:00:00.000Z',
                                id: '00_test_crudCreateOrReplaceOneByKeyUnique'
                            },
                            dataValidateReplace: { propRequired: true },
                            operationId: 'undefined.id'
                        });
                        local.swgg.keyUniqueInit(options);
                        // init paramDict
                        paramDict = {};
                        paramDict.body = local.utility2.objectSetOverride(
                            local.utility2.jsonCopy(options.data),
                            options.dataValidateReplace
                        );
                        // ajax - crudCreateOrReplaceOneByKeyUnique
                        options.crudCreateOrReplaceOneByKeyUnique({
                            paramDict: paramDict
                        }, onNext);
                        break;
                    case 2:
                        // init id
                        options.data.id = data.responseJson.data[0].id;
                        // validate time createdAt
                        local.utility2.assert(data.responseJson.data[0].createdAt >
                            '1970-01-01T00:00:00.000Z', data.responseJson);
                        local.utility2.assert(data.responseJson.data[0].createdAt <
                            new Date().toISOString(), data.responseJson);
                        // validate time updatedAt
                        local.utility2.assert(data.responseJson.data[0].updatedAt >
                            '1970-01-01T00:00:00.000Z', data.responseJson);
                        local.utility2.assert(data.responseJson.data[0].updatedAt <
                            new Date().toISOString(), data.responseJson);
                        // test crudGetOneByKeyUnique's default handling-behavior
                        options.dataValidate = options.dataValidateReplace;
                        local.testCase_crudGetOneByKeyUnique_default(options, onNext);
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudDeleteManyByQuery_default = function (options, onError) {
        /*
         * this function will test crudDeleteManyByQuery's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            crudDeleteManyByQuery:
                                local.swgg.apiDict['_test crudDeleteManyByQuery'],
                            operationId: 'undefined.id',
                            keyValue: '00_test_crudDeleteManyByQuery'
                        });
                        local.swgg.keyUniqueInit(options);
                        // ajax - crudDeleteManyByQuery
                        options.crudDeleteManyByQuery({
                            paramDict: { _queryQuery: JSON.stringify(options.queryByKeyUnique) }
                        }, onNext);
                        break;
                    case 2:
                        // validate data was removed
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 1);
                        local.utility2.assertJsonEqual(data.responseJson.data[0], 1);
                        onNext();
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudDeleteOneByKeyUnique_default = function (options, onError) {
        /*
         * this function will test crudDeleteOneByKeyUnique's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            crudDeleteOneByKeyUnique:
                                local.swgg.apiDict['_test crudDeleteOneByKeyUnique.id'],
                            crudGetOneByKeyUnique:
                                local.swgg.apiDict['_test crudGetOneByKeyUnique.id'],
                            operationId: 'undefined.id',
                            keyValue: '00_test_crudDeleteOneByKeyUnique'
                        });
                        local.swgg.keyUniqueInit(options);
                        // ajax - crudDeleteOneByKeyUnique
                        options.crudDeleteOneByKeyUnique({
                            paramDict: options.queryByKeyUnique
                        }, onNext);
                        break;
                    case 2:
                        // ajax - crudGetOneByKeyUnique
                        options.crudGetOneByKeyUnique({
                            paramDict: options.queryByKeyUnique
                        }, onNext);
                        break;
                    case 3:
                        // validate data was removed
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 1);
                        local.utility2.assert(data.responseJson.data[0] ===
                            null, data.responseJson);
                        onNext();
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudErrorXxx_default = function (options, onError) {
        /*
         * this function will test crudErrorXxx's default handling-behavior
         */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            [
                '_test crudErrorDelete',
                '_test crudErrorGet',
                '_test crudErrorHead',
                '_test crudErrorLogin',
                '_test crudErrorOptions',
                '_test crudErrorPatch',
                '_test crudErrorPre',
                '_test crudErrorPost',
                '_test crudErrorPut'
            ].forEach(function (key) {
                onParallel.counter += 1;
                options = {};
                local.swgg.apiDict[key](options, function (error, data) {
                    local.utility2.tryCatchOnError(function () {
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(data.statusCode, 500);
                        onParallel();
                    }, onError);
                });
            });
            onParallel();
        };

        local.testCase_crudExistsOneByKeyUnique_default = function (options, onError) {
        /*
         * this function will test crudExistsOneByKeyUnique's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = {
                            crudExistsOneByKeyUnique:
                                local.swgg.apiDict['_test crudExistsOneByKeyUnique.id'],
                            operationId: 'undefined.id',
                            keyValue: '00_test_crudExistsOneByKeyUnique'
                        };
                        local.swgg.keyUniqueInit(options);
                        // ajax - crudExistsOneByKeyUnique
                        options.crudExistsOneByKeyUnique({
                            paramDict: options.queryByKeyUnique
                        }, onNext);
                        break;
                    case 2:
                        // validate data exists
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 1);
                        local.utility2.assertJsonEqual(
                            data.responseJson.data[0],
                            true
                        );
                        onNext();
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudFileGetOneByKeyUnique_default = function (options, onError) {
        /*
         * this function will test crudFileGetOneByKeyUnique's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            crudFileGetOneByKeyUnique:
                                local.swgg.apiDict['file crudFileGetOneByKeyUnique.id'],
                            operationId: 'undefined.id',
                            keyValue: '00_test_crudFileGetOneByKeyUnique'
                        });
                        local.swgg.keyUniqueInit(options);
                        // ajax - crudFileGetOneByKeyUnique
                        options.crudFileGetOneByKeyUnique({
                            paramDict: options.queryByKeyUnique
                        }, onNext);
                        break;
                    case 2:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate Content-Type
                        options.data = data.getResponseHeader('content-type');
                        local.utility2.assertJsonEqual(options.data, 'image/png');
                        // validate response
                        options.data = local.utility2.bufferToString(data.response, 'base64');
                        local.utility2.assert(options.data ===
                            local.swgg.templateSwaggerLogoSmallBase64, options.data);
                        // test crudFileGetOneByKeyUnique's 404 handling-behavior
                        local.swgg.apiDict['file crudFileGetOneByKeyUnique.id']({ paramDict: {
                            id: local.utility2.uuidTimeCreate()
                        } }, onNext);
                        break;
                    case 3:
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(data.statusCode, 404);
                        onNext();
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudFileUploadManyByForm_default = function (options, onError) {
        /*
         * this function will test crudFileUploadManyByForm's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = {};
                        options.blob = new local.utility2.Blob([local.utility2.bufferCreate(
                            local.swgg.templateSwaggerLogoSmallBase64,
                            'base64'
                        )], { type: 'image/png' });
                        options.blob.name = 'a00.png';
                        // ajax - crudFileUploadManyByForm
                        local.swgg.apiDict['file crudFileUploadManyByForm.2']({ paramDict: {
                            fileDescription: 'hello',
                            file1: options.blob,
                            file2: options.blob,
                            file3: options.blob
                        } }, onNext);
                        break;
                    case 2:
                        // validate data
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 2);
                        local.utility2.assertJsonEqual(
                            data.responseJson.data[0].fileDescription,
                            'hello'
                        );
                        // init queryByKeyUnique
                        options.keyValue = data.responseJson.data[0].id;
                        options.operationId = 'undefined.id';
                        local.swgg.keyUniqueInit(options);
                        // test crudFileGetOneByKeyUnique's default handling-behavior
                        local.testCase_crudFileGetOneByKeyUnique_default(options, onNext);
                        break;
                    case 3:
                        // test crudDeleteOneByKeyUnique's default handling-behavior
                        local.testCase_crudDeleteOneByKeyUnique_default(options, onNext);
                        break;
                    default:
                        onError(error);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudFileUploadManyByForm_nullCase = function (options, onError) {
        /*
         * this function will test crudFileUploadManyByForm's null-case handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = {};
                        // ajax - crudFileUploadManyByForm
                        local.swgg.apiDict['file crudFileUploadManyByForm.2'](options, onNext);
                        break;
                    case 2:
                        // validate data
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 0);
                        onNext();
                        break;
                    default:
                        onError(error);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudGetManyByQuery_default = function (options, onError) {
        /*
         * this function will test crudGetManyByQuery's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            crudGetManyByQuery: local.swgg.apiDict['_test crudGetManyByQuery'],
                            operationId: 'undefined.id',
                            keyValue: '00_test_crudGetManyByQuery'
                        });
                        local.swgg.keyUniqueInit(options);
                        // ajax - crudGetManyByQuery
                        options.crudGetManyByQuery({
                            paramDict: { _queryQuery: JSON.stringify(options.queryByKeyUnique) }
                        }, onNext);
                        break;
                    case 2:
                        // validate data
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 1);
                        local.utility2.assert(data.responseJson.data[0][options.keyAlias] ===
                            options.keyValue, data.responseJson);
                        onNext();
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudGetOneByKeyUnique_default = function (options, onError) {
        /*
         * this function will test crudGetOneByKeyUnique's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            crudGetOneByKeyUnique:
                                local.swgg.apiDict['_test crudGetOneByKeyUnique.id'],
                            dataValidate: {},
                            operationId: 'undefined.id',
                            keyValue: '00_test_crudGetOneByKeyUnique'
                        });
                        local.swgg.keyUniqueInit(options);
                        // ajax - crudGetOneByKeyUnique
                        options.crudGetOneByKeyUnique({
                            paramDict: options.queryByKeyUnique
                        }, onNext);
                        break;
                    case 2:
                        // validate data
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 1);
                        local.utility2.assert(data.responseJson.data[0][options.keyAlias] ===
                            options.keyValue, data.responseJson);
                        // validate dataValidate
                        Object.keys(options.dataValidate).forEach(function (key) {
                            local.utility2.assert(
                                data.responseJson.data[0][key] === options.dataValidate[key],
                                [key, data.responseJson.data[0][key], options.dataValidate[key]]
                            );
                        });
                        // cleanup dataValidate
                        options.dataValidate = {};
                        onNext(null, data);
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudGetOneByQuery_default = function (options, onError) {
        /*
         * this function will test crudGetOneByQuery's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            crudGetOneByQuery: local.swgg.apiDict['_test crudGetOneByQuery'],
                            operationId: 'undefined.id',
                            keyValue: '00_test_crudGetOneByQuery'
                        });
                        local.swgg.keyUniqueInit(options);
                        // ajax - crudGetOneByQuery
                        options.crudGetOneByQuery({
                            paramDict: { _queryQuery: JSON.stringify(options.queryByKeyUnique) }
                        }, onNext);
                        break;
                    case 2:
                        // validate data
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 1);
                        local.utility2.assert(data.responseJson.data[0][options.keyAlias] ===
                            options.keyValue, data.responseJson);
                        onNext();
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_crudNullXxx_default = function (options, onError) {
        /*
         * this function will test crudNullXxx's default handling-behavior
         */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            options = {};
            [
                '_test crudNullDelete',
                '_test crudNullGet',
                '_test crudNullHead',
                '_test crudNullOptions',
                '_test crudNullPatch',
                '_test crudNullPost',
                '_test crudNullPut'
            ].forEach(function (key) {
                onParallel.counter += 1;
                local.swgg.apiDict[key](options, onParallel);
            });
            onParallel();
        };

        local.testCase_crudUpdateOneByKeyUnique_default = function (options, onError) {
        /*
         * this function will test crudUpdateOneByKeyUnique's default handling-behavior
         */
            var modeNext, onNext, paramDict;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = local.utility2.objectSetDefault(options || {}, {
                            crudUpdateOneByKeyUnique:
                                local.swgg.apiDict['_test crudUpdateOneByKeyUnique.id'],
                            data: { id: '00_test_crudUpdateOneByKeyUnique' },
                            dataValidateUpdate1: { propRequired: true },
                            dataValidateUpdate2: { propRequired: false },
                            operationId: 'undefined.id'
                        });
                        local.swgg.keyUniqueInit(options);
                        // test crudGetOneByKeyUnique's default handling-behavior
                        options.dataValidate = options.dataValidateUpdate1;
                        local.testCase_crudGetOneByKeyUnique_default(options, onNext);
                        break;
                    case 2:
                        options.createdAt = data.responseJson.data[0].createdAt;
                        options.updatedAt = data.responseJson.data[0].updatedAt;
                        // init paramDict
                        paramDict = local.utility2.jsonCopy(options.queryByKeyUnique);
                        paramDict.body = local.utility2.objectSetOverride(
                            local.utility2.jsonCopy(options.data),
                            options.dataValidateUpdate2
                        );
                        // test application/x-www-form-urlencoded's handling-behavior
                        local.utility2.objectSetOverride(paramDict, paramDict.body);
                        // ajax - crudUpdateOneByKeyUnique
                        options.crudUpdateOneByKeyUnique({ paramDict: paramDict }, onNext);
                        break;
                    case 3:
                        // validate time createdAt
                        local.utility2.assert(data.responseJson.data[0].createdAt ===
                            options.createdAt, data.responseJson);
                        local.utility2.assert(data.responseJson.data[0].createdAt <
                            new Date().toISOString(), data.responseJson);
                        // validate time updatedAt
                        local.utility2.assert(data.responseJson.data[0].updatedAt >
                            options.updatedAt, data.responseJson);
                        local.utility2.assert(data.responseJson.data[0].updatedAt <
                            new Date().toISOString(), data.responseJson);
                        // test crudGetOneByKeyUnique's default handling-behavior
                        options.dataValidate = local.utility2.objectSetOverride(
                            local.utility2.jsonCopy(options.dataValidateUpdate1),
                            options.dataValidateUpdate2
                        );
                        local.testCase_crudGetOneByKeyUnique_default(options, onNext);
                        break;
                    default:
                        onError(error, data);
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_nedbReset_default = function (options, onError) {
        /*
         * this function will test nedbReset's default handling-behavior
         */
            options = [
                [local.swgg, {
                    collectionDict: { aa: { loadDatabase : function (onError) {
                        onError();
                    } } },
                    Nedb: { fileReset: function (onError) {
                        onError();
                    } }
                }]
            ];
            local.utility2.testMock(options, function (onError) {
                local.swgg.nedbReset(onError);
            }, onError);
        };

        local.testCase_onErrorJsonapi_default = function (options, onError) {
        /*
         * this function will test onErrorJsonapi's default handling-behavior
         */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            [
                'hello',
                ['hello'],
                { data: ['hello'], meta: { isJsonapiResponse: true } }
            ].forEach(function (_) {
                options = _;
                onParallel.counter += 1;
                local.swgg.apiDict['_test onErrorJsonapi']({ paramDict: {
                    data: JSON.stringify(options)
                } }, function (error, data) {
                    local.utility2.tryCatchOnError(function () {
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate data
                        local.utility2.assertJsonEqual(
                            data.responseJson.data[0],
                            'hello'
                        );
                        onParallel();
                    }, onError);
                });
            });
            onParallel();
        };

        local.testCase_onErrorJsonapi_emptyArray = function (options, onError) {
        /*
         * this function will test onErrorJsonapi's empty-array handling-behavior
         */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            options = { paramDict: { data: '[]' } };
            onParallel.counter += 1;
            local.swgg.apiDict['_test onErrorJsonapi'](options, function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate data
                    local.utility2.assertJsonEqual(
                        data.responseJson.data[0],
                        undefined
                    );
                    onParallel();
                }, onError);
            });
            options = { paramDict: { error: '[]' } };
            onParallel.counter += 1;
            local.swgg.apiDict['_test onErrorJsonapi'](options, function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate error occurred
                    local.utility2.assert(error, error);
                    // validate error
                    local.utility2.assert(data.responseJson.errors[0].message ===
                        'null', error);
                    onParallel();
                }, onError);
            });
            onParallel();
        };

        local.testCase_onErrorJsonapi_error = function (options, onError) {
        /*
         * this function will test onErrorJsonapi's error handling-behavior
         */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            [
                'hello',
                ['hello'],
                [{ message: 'hello' }],
                {
                    errors: [{ message: 'hello' }],
                    meta: { isJsonapiResponse: true },
                    statusCode: 500
                }
            ].forEach(function (data) {
                options = { paramDict: { error: JSON.stringify(data) } };
                onParallel.counter += 1;
                local.swgg.apiDict['_test onErrorJsonapi'](options, function (error, data) {
                    local.utility2.tryCatchOnError(function () {
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // validate error
                        local.utility2.assert(data.responseJson.errors[0].message ===
                            'hello', error);
                        onParallel();
                    }, onError);
                });
            });
            onParallel();
        };

        local.testCase_petstoreStoreGetInventory_default = function (options, onError) {
        /*
         * this function will test petstoreStoreGetInventory's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, [modeNext, error]);
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        options = {};
                        local.swgg.apiDict['store getInventory'](options, onNext);
                        break;
                    default:
                        // validate data
                        local.utility2.assertJsonEqual(data.responseJson.data.length, 1);
                        local.utility2.assert(data.responseJson.data[0]);
                        onError();
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_userLoginXxx_default = function (options, onError) {
        /*
         * this function will test userLoginXxx's default handling-behavior
         */
            var modeNext, onNext;
            modeNext = 0;
            onNext = function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    modeNext += 1;
                    switch (modeNext) {
                    case 1:
                        // cleanup userJwtEncoded
                        delete local.swgg.userJwtEncoded;
                        // test userLogout's default handling-behavior
                        options = {};
                        local.swgg.userLogout(options, onNext);
                        break;
                    case 2:
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // test userLoginByPassword's 401 handling-behavior
                        options = { password: 'undefined', username: 'undefined' };
                        local.swgg.userLoginByPassword(options, onNext);
                        break;
                    case 3:
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(data.statusCode, 401);
                        // validate userJwtEncoded does not exist
                        local.utility2.assert(
                            !local.swgg.userJwtEncoded,
                            local.swgg.userJwtEncoded
                        );
                        // test userLogout's 401 handling-behavior
                        options = {};
                        local.swgg.userLogout(options, onNext);
                        break;
                    case 4:
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(data.statusCode, 401);
                        // validate userJwtEncoded does not exist
                        local.utility2.assert(
                            !local.swgg.userJwtEncoded,
                            local.swgg.userJwtEncoded
                        );
                        // test userLoginByPassword's 200 handling-behavior
                        options = { password: 'secret', username: 'admin' };
                        local.swgg.userLoginByPassword(options, onNext);
                        break;
                    case 5:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(data.statusCode, 200);
                        // validate userJwtEncoded exists
                        local.utility2.assert(
                            local.swgg.userJwtEncoded,
                            local.swgg.userJwtEncoded
                        );
                        // test userLogout's 200 handling-behavior
                        // test jwtEncoded's update handling-behavior
                        options = { jwtDecrypted: { sub: 'admin' } };
                        local.swgg.jwtDecodedEncryptAndEncode(options);
                        local.swgg.userLogout(options, onNext);
                        break;
                    case 6:
                        // validate no error occurred
                        local.utility2.assert(!error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(data.statusCode, 200);
                        // validate userJwtEncoded exists
                        local.utility2.assert(
                            local.swgg.userJwtEncoded,
                            local.swgg.userJwtEncoded
                        );
                        // test userLogout's 401 handling-behavior
                        options = {};
                        local.swgg.userLogout(options, onNext);
                        break;
                    case 7:
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(data.statusCode, 401);
                        // test userLoginByPassword's 400 handling-behavior
                        local.utility2.ajax({
                            url: '/api/v0/user/crudUserLoginByPassword?password=1'
                        }, onNext);
                        break;
                    case 8:
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(data.statusCode, 400);
                        // test userLogout's invalid-username handling-behavior
                        options = { jwtDecrypted: { sub: 'undefined' } };
                        local.swgg.jwtDecodedEncryptAndEncode(options);
                        local.swgg.userLogout(options, onNext);
                        break;
                    case 9:
                        // validate error occurred
                        local.utility2.assert(error, error);
                        // validate statusCode
                        local.utility2.assertJsonEqual(data.statusCode, 401);
                        onError(null, data);
                        break;
                    }
                }, onError);
            };
            onNext();
        };

        local.testCase_validateByParamDefList_default = function (options, onError) {
        /*
         * this function will test validateByParamDefList's default handling-behavior
         */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            // test nop handling-behavior
            local.swgg.validateByParamDefList({ data: {} });
            options = { paramDict: {
                id: '00_test_' + local.utility2.uuidTimeCreate(),
                // test array-param handling-behavior
                paramArray: ['aa', 'bb'],
                // test body-param handling-behavior
                paramBody: { aa: { bb: 'hello body' } },
                // test boolean-param handling-behavior
                paramBoolean: true,
                // test enum-multiple-param handling-behavior
                paramEnumMultiple: [0, 1],
                // test enum-single-param handling-behavior
                paramEnumSingle: 0,
                // test header-param handling-behavior
                paramHeader: 'hello header',
                // test json-param handling-behavior
                paramJson: '"hello json"',
                // test path-param handling-behavior
                paramPath: 'hello path',
                // test required-param handling-behavior
                paramRequired: 'hello required'
            } };
            onParallel.counter += 1;
            local.swgg.apiDict['_test paramDefault'](options, function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate object
                    local.utility2.assertJsonEqual(data.responseJson.data[0], {
                        paramArray: ['aa', 'bb'],
                        paramBody: { aa: { bb: 'hello body' } },
                        paramBoolean: true,
                        paramEnumMultiple: [0, 1],
                        paramEnumSingle: 0,
                        paramHeader: 'hello header',
                        paramJson: '"hello json"',
                        paramPath: 'hello path',
                        paramRequired: 'hello required'
                    });
                    onParallel();
                }, onError);
            });
            options = { paramDict: {
                id: '00_test_' + local.utility2.uuidTimeCreate(),
                // test body-array-param handling-behavior
                paramBodyArray: [{ aa: { bb: 'hello body' } }, null]
            } };
            onParallel.counter += 1;
            local.swgg.apiDict['_test paramBodyArray'](options, function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate object
                    local.utility2.assertJsonEqual(data.responseJson.data[0], {
                        paramBodyArray: [{ aa: { bb: 'hello body' } }, null]
                    });
                    onParallel();
                }, onError);
            });
            onParallel();
        };

        local.testCase_validateByParamDefList_error = function (options, onError) {
        /*
         * this function will test validateByParamDefList's error handling-behavior
         */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            options = { paramPath: 'hello path', paramRequired: 'hello required' };
            [
                { key: 'paramArray', value: true },
                { key: 'paramEnumSingle', value: true },
                { key: 'paramHeader', value: true },
                { key: 'paramJson', value: true },
                { key: 'paramOptional', value: true },
                { key: 'paramPath', value: true },
                { key: 'paramRequired', value: true }
            ].forEach(function (element) {
                element.paramDict = local.utility2.jsonCopy(options);
                element.paramDict[element.key] = element.value;
                onParallel.counter += 1;
                local.swgg.apiDict['_test paramDefault'](element, function (error) {
                    local.utility2.tryCatchOnError(function () {
                        // validate error occurred
                        local.utility2.assert(error, element);
                        onParallel();
                    }, onError);
                });
            });
            onParallel();
        };

        local.testCase_validateByParamDefList_formData = function (options, onError) {
        /*
         * this function will test validateByParamDefList's formData handling-behavior
         */
            options = { paramDict: {
                paramFormData1: 'hello formData1',
                paramFormData2: 'hello formData2'
            } };
            local.swgg.apiDict['_test paramFormData'](options, function (error, data) {
                local.utility2.tryCatchOnError(function () {
                    // validate no error occurred
                    local.utility2.assert(!error, error);
                    // validate object
                    local.utility2.assertJsonEqual(data.responseJson.data[0], {
                        paramFormData1: 'hello formData1',
                        paramFormData2: 'hello formData2'
                    });
                    onError();
                }, onError);
            });
        };

        local.testCase_validateBySchema_default = function (options, onError) {
        /*
         * this function will test validateBySchema's default handling-behavior
         */
            options = {
                data: { propRequired: true },
                schema: local.swgg.swaggerJson.definitions.TestCrud
            };
            [
                { key: 'propArray', value: [null] },
                { key: 'propArray2', value: [null] },
                { key: 'propArraySubdoc', value: [{ propRequired: true }] },
                { key: 'propBoolean', value: true },
                { key: 'propEnum', value: 0 },
                { key: 'propInteger', value: 0 },
                { key: 'propInteger2', value: 0 },
                { key: 'propIntegerInt32', value: 0 },
                { key: 'propIntegerInt64', value: 0 },
                { key: 'propNumber', value: 0.5 },
                { key: 'propNumber2', value: -0.5 },
                { key: 'propNumber3', value: 0.5 },
                { key: 'propNumberDouble', value: 0.5 },
                { key: 'propNumberFloat', value: 0.5 },
                { key: 'propObject', value: { aa: true } },
                { key: 'propObject2', value: { aa: true } },
                { key: 'propObjectSubdoc', value: {} },
                { key: 'propRequired', value: true },
                { key: 'propString', value: 'hello' },
                { key: 'propString2', value: 'hello' },
                { key: 'propStringBinary', value: '\u1234' },
                { key: 'propStringByte', value:
                    local.utility2.stringToBase64(local.utility2.stringAsciiCharset) },
                { key: 'propStringDate', value: '1971-01-01' },
                { key: 'propStringDatetime', value: '1971-01-01T00:00:00Z' },
                { key: 'propStringEmail', value: 'a@a.com' },
                { key: 'propStringJson', value: 'true' },
                { key: 'propUndefined', value: '' },
                { key: 'propUndefined', value: 0 },
                { key: 'propUndefined', value: false },
                { key: 'propUndefined', value: null },
                { key: 'propUndefined', value: true },
                { key: 'propUndefined', value: undefined },
                { key: 'propUndefined', value: {} }
            ].forEach(function (element) {
                element.data = local.utility2.jsonCopy(options.data);
                element.data[element.key] = element.value;
                element.schema = options.schema;
                // test circular-reference handling-behavior
                element.data.propArraySubdoc = element.data.propArraySubdoc || [element.data];
                element.data.propObject = element.data.propObject || element.data;
                element.data.propObjectSubdoc = element.data.propObjectSubdoc || element.data;
                local.swgg.validateBySchema(element);
            });
            onError();
        };

        local.testCase_validateBySchema_error = function (options, onError) {
        /*
         * this function will test validateBySchema's error handling-behavior
         */
            var onParallel;
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            options = {
                data: { propRequired: true },
                schema: local.swgg.swaggerJson.definitions.TestCrud
            };
            [
                { data: null },
                { key: 'propArray', value: true },
                { key: 'propArray2', value: [] },
                { key: 'propArray2', value: [null, null] },
                { key: 'propArraySubdoc', value: [{ propRequired: null }] },
                { key: 'propArraySubdoc', value: [ 'non-object' ] },
                { key: 'propArraySubdoc', value: [{ propRequired: null }] },
                { key: 'propBoolean', value: 0 },
                { key: 'propEnum', value: -1 },
                { key: 'propInteger', value: 0.5 },
                { key: 'propInteger', value: Infinity },
                { key: 'propInteger', value: NaN },
                { key: 'propInteger', value: true },
                { key: 'propInteger2', value: -2 },
                { key: 'propInteger2', value: -1 },
                { key: 'propInteger2', value: 1 },
                { key: 'propInteger2', value: 2 },
                { key: 'propIntegerInt32', value: 0.5 },
                { key: 'propIntegerInt64', value: 0.5 },
                { key: 'propNumber', value: Infinity },
                { key: 'propNumber', value: NaN },
                { key: 'propNumber', value: true },
                { key: 'propNumber2', value: -1 },
                { key: 'propNumber2', value: -0.25 },
                { key: 'propNumber2', value: 0 },
                { key: 'propNumber3', value: 0 },
                { key: 'propNumber3', value: 0.25 },
                { key: 'propNumber3', value: 1 },
                { key: 'propNumberDouble', value: true },
                { key: 'propNumberFloat', value: true },
                { key: 'propObject', value: true },
                { key: 'propObject2', value: {} },
                { key: 'propObject2', value: { aa: 1, bb: 2 } },
                { key: 'propObjectSubdoc', value: 'non-object' },
                { key: 'propRequired', value: null },
                { key: 'propRequired', value: undefined },
                { key: 'propString', value: true },
                { key: 'propString2', value: '' },
                { key: 'propString2', value: '!' },
                { key: 'propString2', value: '01234567890123456789' },
                { key: 'propStringByte', value: local.utility2.stringAsciiCharset },
                { key: 'propStringDate', value: 'null' },
                { key: 'propStringDatetime', value: 'null' },
                { key: 'propStringEmail', value: 'null' },
                { key: 'propStringJson', value: 'syntax error' }
            ].forEach(function (element) {
                onParallel.counter += 1;
                local.utility2.tryCatchOnError(function () {
                    if (element.data === undefined) {
                        element.data = local.utility2.jsonCopy(options.data);
                        element.data[element.key] = element.value;
                    }
                    element.schema = options.schema;
                    local.swgg.validateBySchema(element);
                }, function (error) {
                    // validate error occurred
                    local.utility2.assert(error, element);
                    onParallel();
                });
            });
            onParallel();
        };

        local.testCase_validateBySwagger_default = function (options, onError) {
        /*
         * this function will test validateBySwagger's default handling-behavior
         */
            options = {};
            local.utility2.testMock([
                // suppress console.error
                [console, { error: local.utility2.nop }]
            ], function (onError) {
                [null, {}].forEach(function (element) {
                    local.utility2.tryCatchOnError(function () {
                        local.swgg.validateBySwagger(element);
                    }, function (error) {
                        options.data = error;
                    });
                    // validate error occurred
                    local.utility2.assert(options.data, options.data);
                });
                onError();
            }, onError);
        };
    }());
    switch (local.modeJs) {



    // run browser js-env code - function
    case 'browser':
        local.testCase_domAnimateShake_default = function (options, onError) {
        /*
         * this function will test domAnimateShake's default handling-behavior
         */
            options = {};
            options.element = document.querySelector('div');
            local.swgg.domAnimateShake(options.element);
            setTimeout(onError, 1500);
        };

        /* istanbul ignore next */
        local.testCase_ui_default = function (options, onError) {
        /*
         * this function will test the ui's default handling-behavior
         */
            options = {};
            options.onParallel = local.utility2.onParallel(onError);
            options.onParallel.counter += 1;
            Object.keys(local.swgg.eventListenerDict).sort().forEach(function (selector) {
                local.utility2.domQuerySelectorAll(
                    document,
                    selector
                ).forEach(function (element, ii, list) {
                    [null, null].forEach(function () {
                        options.onParallel.counter += 1;
                        setTimeout(function () {
                            options.onParallel();
                            local.swgg.eventDelegate({
                                currentTarget: element.closest('.eventDelegateClick'),
                                preventDefault: local.utility2.nop,
                                stopPropagation: local.utility2.nop,
                                target: element
                            });
                        }, ii * 1000 / list.length);
                    });
                });
            });
            options.onParallel();
        };
        break;



    // run node js-env code - function
    case 'node':
        local.testCase_build_assets = function (options, onError) {
        /*
         * this function will test build's asset handling-behavior
         */
            var onParallel;
            // jslint-hack
            local.utility2.nop(options);
            onParallel = local.utility2.onParallel(onError);
            onParallel.counter += 1;
            [{
                file: '/index.html',
                url: '/'
            }, {
                file: '/api/v0/swagger.json',
                url: '/api/v0/swagger.json'
            }, {
                file: '/assets.example.js',
                url: '/assets.example.js'
            }, {
                file: '/assets.swgg.admin-ui.html',
                url: '/assets.swgg.admin-ui.html'
            }, {
                file: '/assets.swgg.css',
                url: '/assets.swgg.css'
            }, {
                file: '/assets.swgg.js',
                url: '/assets.swgg.js'
            }, {
                file: '/assets.swgg.lib.admin-ui.js',
                url: '/assets.swgg.lib.admin-ui.js'
            }, {
                file: '/assets.swgg.lib.nedb.js',
                url: '/assets.swgg.lib.nedb.js'
            }, {
                file: '/assets.swgg.lib.swagger-ui.js',
                url: '/assets.swgg.lib.swagger-ui.js'
            }, {
                file: '/assets.test.js',
                url: '/assets.test.js'
            }, {
                file: '/assets.utility2.css',
                url: '/assets.utility2.css'
            }, {
                file: '/assets.utility2.rollup.js',
                url: '/assets.utility2.rollup.js'
            }, {
                file: '/jsonp.swgg.stateInit.js',
                url: '/jsonp.swgg.stateInit.js'
            }, {
                file: '/swagger-ui.html',
                url: '/swagger-ui.html'
            }].forEach(function (options) {
                onParallel.counter += 1;
                local.utility2.ajax(options, function (error, xhr) {
                    // validate no error occurred
                    onParallel.counter += 1;
                    onParallel(error);
                    local.utility2.fsWriteFileWithMkdirp(
                        local.utility2.envDict.npm_config_dir_build + '/app' + options.file,
                        xhr.response,
                        onParallel
                    );
                });
            });
            // copy external dir
            local.fs.readdirSync('external').forEach(function (file) {
                onParallel.counter += 1;
                local.utility2.fsWriteFileWithMkdirp(
                    local.utility2.envDict.npm_config_dir_build + '/app/' + file,
                    local.fs.readFileSync('external/' + file),
                    onParallel
                );
            });
            onParallel();
        };

        local.testCase_testPage_default = function (options, onError) {
        /*
         * this function will test the test-page's default handling-behavior
         */
            options = {
                modeCoverageMerge: true,
                url: local.utility2.serverLocalHost +
                    '/?modeTest=consoleLogResult#!/swgg_id_pet/swgg_id_addPet'
            };
            local.utility2.browserTest(options, onError);
        };
        break;
    }



    // run shared js-env code - post-init
    (function () {
        // init test api
        local.swgg.apiDictUpdate({
            definitions: {
                // init onErrorJsonapi schema
                onErrorJsonapi: {
                    _pathPrefix: '_test',
                    properties: {
                        data: { type: 'object' },
                        error: { default: {}, type: 'object' }
                    }
                },
                // init File schema
                File: {
                    _pathObjectDefaultList: [
                        'crudFileUploadManyByForm.2'
                    ],
                    _pathPrefix: 'file',
                    'x-swgg-inherit': { $ref: '#/definitions/BuiltinFile' }
                },
                // init TestCrud schema
                TestCrud: {
                    // init _pathObjectDefaultList
                    _pathObjectDefaultList: [
                        'crudCountManyByQuery',
                        'crudCreateOrReplaceMany',
                        'crudCreateOrReplaceOneByKeyUnique.id',
                        'crudCreateOrReplaceOneByKeyUnique.propStringUnique',
                        'crudDeleteManyByQuery',
                        'crudDeleteOneByKeyUnique.id',
                        'crudErrorDelete',
                        'crudErrorGet',
                        'crudErrorHead',
                        'crudErrorLogin',
                        'crudErrorOptions',
                        'crudErrorPatch',
                        'crudErrorPre',
                        'crudErrorPost',
                        'crudErrorPut',
                        'crudExistsOneByKeyUnique.id',
                        'crudGetManyByQuery',
                        'crudGetOneByQuery',
                        'crudGetOneByKeyUnique.id',
                        'crudNullDelete',
                        'crudNullGet',
                        'crudNullHead',
                        'crudNullOptions',
                        'crudNullPatch',
                        'crudNullPost',
                        'crudNullPut',
                        'crudUpdateOneByKeyUnique.id'
                    ],
                    _pathPrefix: '_test',
                    properties: {
                        _id: { readOnly: true, type: 'string' },
                        id: { type: 'string' },
                        createdAt: { format: 'date-time', readOnly: true, type: 'string' },
                        propArray: { items: {}, type: 'array' },
                        propArray2: {
                            items: {},
                            maxItems: 1,
                            minItems: 1,
                            type: 'array',
                            uniqueItems: true
                        },
                        propArraySubdoc: {
                            default: [{ propRequired: true }],
                            items: { $ref: '#/definitions/TestCrud' },
                            type: 'array'
                        },
                        propArraySubdocFile: {
                            items: { $ref: '#/definitions/BuiltinFile' },
                            type: 'array',
                            'x-swgg-fileUpload': true
                        },
                        propBoolean: { type: 'boolean' },
                        propEnum: { enum: [0, 1], type: 'integer' },
                        propInteger: { type: 'integer' },
                        propInteger2: {
                            exclusiveMaximum: true,
                            exclusiveMinimum: true,
                            maximum: 2,
                            minimum: -2,
                            multipleOf: 2,
                            type: 'integer'
                        },
                        propIntegerInt32: { format: 'int32', type: 'integer' },
                        propIntegerInt64: { format: 'int64', type: 'integer' },
                        propNumber: { type: 'number' },
                        propNumber2: {
                            default: -0.5,
                            exclusiveMaximum: true,
                            exclusiveMinimum: true,
                            maximum: 0,
                            minimum: -1,
                            multipleOf: 0.5,
                            type: 'number'
                        },
                        propNumber3: {
                            default: 0.5,
                            exclusiveMaximum: true,
                            exclusiveMinimum: true,
                            maximum: 1,
                            minimum: 0,
                            multipleOf: 0.5,
                            type: 'number'
                        },
                        propNumberDouble: { format: 'double', type: 'number' },
                        propNumberFloat: { format: 'float', type: 'number' },
                        propObject: { type: 'object' },
                        propObject2: {
                            default: { aa: true },
                            maxProperties: 1,
                            minProperties: 1,
                            type: 'object'
                        },
                        // test null-schema-validation handling-behavior
                        propObjectSubdoc: { $ref: '#/definitions/TestNull' },
                        propRequired: { default: true },
                        propString: { type: 'string' },
                        propString2: {
                            maxLength: 10,
                            minLength: 1,
                            pattern: '^\\w*$',
                            type: 'string'
                        },
                        propStringBinary: { format: 'binary', type: 'string' },
                        propStringByte: { format: 'byte', type: 'string' },
                        propStringDate: { format: 'date', type: 'string' },
                        propStringDatetime: { format: 'date-time', type: 'string' },
                        propStringEmail:
                            { default: 'a@a.com', format: 'email', type: 'string' },
                        propStringJson: { default: 'null', format: 'json', type: 'string' },
                        propStringUnique: { type: 'string' },
                        propUndefined: {},
                        propObjectSubdocFile: {
                            $ref: '#/definitions/BuiltinFile',
                            'x-swgg-fileUpload': true
                        },
                        updatedAt: { format: 'date-time', readOnly: true, type: 'string' }
                    },
                    required: ['propRequired'],
                    'x-swgg-inherit': { $ref: '#/definitions/BuiltinFile' }
                },
                // init TestNull schema
                TestNull: {}
            },
            paths: {
                // test undefined api handling-behavior
                '/_test/errorUndefinedApi': { get: {
                    operationId: 'errorUndefinedApi',
                    summary: 'test undefined api handling-behavior',
                    tags: ['_test']
                } },
                // test onErrorJsonapi handling-behavior
                '/_test/onErrorJsonapi': { get: {
                    operationId: 'onErrorJsonapi',
                    parameters: [{
                        description: 'data param',
                        format: 'json',
                        in: 'query',
                        name: 'data',
                        type: 'string'
                    }, {
                        description: 'error param',
                        format: 'json',
                        in: 'query',
                        name: 'error',
                        type: 'string'
                    }],
                    summary: 'test onErrorJsonapi handling-behavior',
                    tags: ['_test']
                } },
                // test default-param handling-behavior
                '/_test/paramDefault/{paramPath}': { post: {
                    operationId: 'paramDefault',
                    parameters: [{
                        // test array-param handling-behavior
                        default: ['aa', 'bb'],
                        description: 'array-param',
                        in: 'query',
                        items: { type: 'string' },
                        name: 'paramArray',
                        type: 'array'
                    }, {
                        // test body-param handling-behavior
                        description: 'body-param',
                        in: 'body',
                        name: 'paramBody',
                        schema: { type: 'object' }
                    }, {
                        // test boolean-param handling-behavior
                        default: true,
                        description: 'boolean-param',
                        in: 'query',
                        name: 'paramBoolean',
                        type: 'boolean'
                    }, {
                        // test enum-multiple-param handling-behavior
                        description: 'enum-multiple-param',
                        enum: [null, 0, 1, 2, 3, 4],
                        in: 'query',
                        items: { type: 'integer' },
                        name: 'paramEnumMultiple',
                        type: 'array'
                    }, {
                        // test enum-single-param handling-behavior
                        description: 'enum-single-param',
                        enum: [null, 0, 1, 2, 3, 4],
                        in: 'query',
                        name: 'paramEnumSingle',
                        type: 'integer'
                    }, {
                        // test header-param handling-behavior
                        description: 'header-param',
                        in: 'header',
                        name: 'paramHeader',
                        type: 'string'
                    }, {
                        // test json-param handling-behavior
                        description: 'json-param',
                        format: 'json',
                        in: 'query',
                        name: 'paramJson',
                        type: 'string'
                    }, {
                        // test optional-param handling-behavior
                        description: 'optional-param',
                        in: 'query',
                        name: 'paramOptional',
                        type: 'string'
                    }, {
                        // test path-param handling-behavior
                        default: 'hello path',
                        description: 'path-param',
                        in: 'path',
                        name: 'paramPath',
                        required: true,
                        type: 'string'
                    }, {
                        // test required-param handling-behavior
                        default: 'hello required',
                        description: 'required-param',
                        in: 'query',
                        name: 'paramRequired',
                        required: true,
                        type: 'string'
                    }],
                    summary: 'test default-param handling-behavior',
                    tags: ['_test']
                } },
                // test body-array-param handling-behavior
                '/_test/paramBodyArray': { post: {
                    operationId: 'paramBodyArray',
                    parameters: [{
                        // test body-array-param handling-behavior
                        description: 'body-array-param',
                        in: 'body',
                        name: 'paramBodyArray',
                        schema: { items: { type: 'object' }, type: 'array' }
                    }],
                    summary: 'test body-array-param handling-behavior',
                    tags: ['_test']
                } },
                // test form-data-param handling-behavior
                '/_test/paramFormData': { post: {
                    operationId: 'paramFormData',
                    parameters: [{
                        description: 'form-data-param 1',
                        in: 'formData',
                        name: 'paramFormData1',
                        type: 'string'
                    }, {
                        description: 'form-data-param 2',
                        in: 'formData',
                        name: 'paramFormData2',
                        type: 'string'
                    }],
                    summary: 'test form-data-param handling-behavior',
                    tags: ['_test']
                } }
            },
            tags: [{
                name: '_test',
                description: 'internal test-api'
            }]
        });
        // test redundant http-body-parse-middleware handling-behavior
        local.middleware.middlewareList.push(local.swgg.middlewareBodyParse);
        // init test-middleware
        local.middleware.middlewareList.push(function (request, response, nextMiddleware) {
            switch (request.swgg.pathObject && request.swgg.pathObject.operationId) {
            case 'onErrorJsonapi':
                // test redundant onErrorJsonapi handling-behavior
                local.swgg.onErrorJsonapi(function (error, data) {
                    local.swgg.serverRespondJsonapi(request, response, error, data);
                })(
                    JSON.parse(request.swgg.paramDict.error || 'null'),
                    JSON.parse(request.swgg.paramDict.data || 'null')
                );
                break;
            case 'paramBodyArray':
            case 'paramDefault':
            case 'paramFormData':
                // test redundant onErrorJsonapi handling-behavior
                local.swgg.serverRespondJsonapi(
                    request,
                    response,
                    null,
                    request.swgg.paramDict
                );
                break;
            default:
                // serve file
                local.utility2.middlewareFileServer(request, response, nextMiddleware);
            }
        });
        // init serverLocal
        local.utility2.serverLocalUrlTest = function (url) {
            url = local.utility2.urlParse(url).pathname;
            return local.modeJs === 'browser' &&
                url.indexOf('/api/v0/swagger.json') < 0 &&
                (/\/api\/v0\/|\/test\./).test(url);
        };
        // init collectionList-fixtures
        local.utility2.onReady.counter += 1;
        local.swgg.collectionListInit([{
            collectDocList: local.swgg.collectDocListRandomCreate({
                collectDocList: [{
                    id: '00_test_crudCountManyByQuery',
                    propRequired: true
                }, {
                    id: '00_test_crudDeleteOneByKeyUnique',
                    propRequired: true
                }, {
                    id: '00_test_crudDeleteManyByQuery',
                    propRequired: true
                }, {
                    id: '00_test_crudExistsOneByKeyUnique',
                    propRequired: true
                }, {
                    id: '00_test_crudGetManyByQuery',
                    propRequired: true
                }, {
                    id: '00_test_crudGetOneByKeyUnique',
                    propRequired: true
                }, {
                    id: '00_test_crudGetOneByQuery',
                    propRequired: true
                }, {
                    id: '00_test_crudUpdateOneByKeyUnique',
                    propRequired: true
                }],
                // init 100 extra random objects
                length: 100,
                override: function (options) {
                    return {
                        id: '00_test_collectDocListRandomCreate_' + (options.ii + 100)
                    };
                },
                properties: local.swgg.swaggerJson.definitions.TestCrud.properties
            }),
            drop: true,
            ensureIndexList: [{
                fieldName: 'id',
                unique: true
            }, {
                fieldName: 'propStringUnique',
                sparse: true,
                unique: true
            }],
            name: 'TestCrud',
            // test removeIndexList handling-behavior
            removeIndexList: ['undefined']
        }, {
            collectDocList: [{
                id: '00_test_crudFileGetOneByKeyUnique',
                fileBlob: local.swgg.templateSwaggerLogoSmallBase64,
                fileContentType: 'image/png',
                propRequired: true
            }],
            name: 'File'
        }], local.utility2.onReady);
        local.swgg.collectionListInit([{
            // test error handling-behavior
            error: local.utility2.errorDefault
        }], local.utility2.nop);
    }());
    switch (local.modeJs) {



    // run node js-env code - post-init
    case 'node':
        // init dtList
        local.swgg.apiDictUpdate({ 'x-swgg-dtList': [{
            apiDict: {
                crudCreateOne: '_test crudCreateOrReplaceOneByKeyUnique',
                'crudDeleteOneByKeyUnique.id': '_test crudDeleteOneByKeyUnique.id',
                crudGetManyByQuery: '_test crudGetManyByQuery',
                'crudUpdateOneByKeyUnique.id': '_test crudUpdateOneByKeyUnique.id'
            },
            paginationCountTotal: 'paginationCountTotal',
            schemaName: 'TestCrud',
            title: 'test api',
            urlSwaggerJson: 'api/v0/swagger.json'
        }].concat(JSON.parse(local.swgg.templateDtListPetstore)) });
        // init assets
        local.utility2.assetsDict['/'] = local.utility2.templateRender(
            local.utility2.templateIndexHtml,
            {
                envDict: local.utility2.envDict,
                // add extra scripts
                scriptExtra: '<script src="assets.example.js"></script>' +
                    '<script src="assets.test.js"></script>'
            }
        );
        local.utility2.assetsDict['/assets.swgg.admin-ui.html'] = local.utility2.templateRender(
            local.swgg.templateAssetsSwggAdminUiHtml,
            {
                envDict: local.utility2.envDict,
                // add extra scripts
                scriptExtra: '<script src="assets.example.js"></script>' +
                    '<script src="assets.test.js"></script>'
            }
        );
        local.utility2.assetsDict['/assets.test.js'] =
            local.utility2.istanbulInstrumentInPackage(
                local.fs.readFileSync(__filename, 'utf8'),
                local.swgg.__dirname + '/test.js',
                'swagger-lite'
            );
        // run validation test
        local.testCase_validateByParamDefList_default(null, local.utility2.onErrorDefault);
        local.testCase_validateByParamDefList_error(null, local.utility2.onErrorDefault);
        local.testCase_validateBySchema_default(null, local.utility2.onErrorDefault);
        local.testCase_validateBySchema_error(null, local.utility2.onErrorDefault);
        local.testCase_validateBySwagger_default(null, local.utility2.onErrorDefault);
        // debug dir
        [
            local.utility2.__dirname,
            local.swgg.Nedb.__dirname,
            __dirname
        ].forEach(function (dir) {
            local.fs.readdirSync(dir).forEach(function (file) {
                file = dir + '/' + file;
                local.utility2.onFileModifiedRestart(file);
                switch (local.path.extname(file)) {
                case '.css':
                case '.js':
                case '.json':
                    // jslint file
                    local.utility2.jslintAndPrint(local.fs.readFileSync(file, 'utf8'), file);
                    break;
                }
            });
        });
        // init repl debugger
        local.utility2.replStart();
        break;
    }
}());
