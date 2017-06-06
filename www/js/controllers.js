angular.module('starter.controllers', [])
    // FACTORY AND SERVICES

.factory('localStorage', ['$window', function($window) {
      return {
        set: function(key, value) {
          $window.localStorage[key] = value;
        },
        get: function(key, defaultValue) {
          return $window.localStorage[key] || defaultValue;
        },
        setObject: function(key, value) {
          $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function(key) {
          return JSON.parse($window.localStorage[key] || '{}');
        }
      }
    }])
.service ('generalService', function(localStorage){
    this.email = function (param) {
        var validState = false;
        if (typeof(param)!= 'undefined') {
            var substring = param.substring(param.indexOf('@'), param.length);
            if (substring.indexOf('@')<substring.indexOf('.')) {
                validState = true;
            }
        }
        return validState;
    };
    
    this.empty = function (param) {
        var emptyField = false;
        if (param.length > 0) {
            emptyField = true;
        }
        return emptyField;
    };
    
    this.number = function (param) {
        var validNumber = false;
        if (typeof(param) === 'number') {
            validNumber = true;
        }
        return validNumber;
    };
    
    this.nonOption = function (param) {
        var option = '';
        if (param == 11 || param == 19) {
            option = 'option5';
        } else if (param == 26 ) {
            option = 'option4';
        }
        return option;
    };
    
    this.getOptionItem = function (qObject) {
        var optionObject = {
            options: 0,
            order: [],
            risk: {}
        };
        var opCounter = 0;
        for (var i =1; i<=7; i++) {
            var op = 'option'+i;
            var points = 'o'+i+'Points';

            if (qObject[op]!= null && qObject[op]!= 'NULL') {
                opCounter++;
                var riskScore = null;
                (qObject[points] != null) ? riskScore = qObject[points]*qObject.weight : optionObject.risk[op] = 'na';
                optionObject.order.push(op);
                if (riskScore != null) {
                    if (riskScore <= parseInt(qObject.lowPoints)) { optionObject.risk[op] = 'lowrisk';
                    } else if (riskScore > parseInt(qObject.lowPoints) && riskScore < parseInt(qObject.highPoints)) { optionObject.risk[op] = 'mediumrisk';
                    } else if (riskScore >= parseInt(qObject.highPoints)) {  optionObject.risk[op] = 'highrisk';} 
                }
                
            }
        }

        optionObject.options = opCounter;
        return optionObject;
    };
    
    this.isEmpty = function (obj) {
        // null and undefined are "empty"
        if (obj == null) return true;

        // Assume if it has a length property with a non-zero value
        // that that property is correct.
        if (obj.length > 0)    return false;
        if (obj.length === 0)  return true;

        // Otherwise, does it have any properties of its own?
        // Note that this doesn't handle
        // toString and valueOf enumeration bugs in IE < 9
        for (var key in obj) {
            if (hasOwnProperty.call(obj, key)) return false;
        }
        return true;
    };
    
    this.updateLSData = function (lskey, okey, subkey, subvalue) {
        var element = localStorage.getObject(lskey);
        if (subkey === 'answer' || subkey === 'score' || subkey === 'risk' || subkey === 'question') {
            element['answers'][okey][subkey] = subvalue;
        } else {
            element[okey][subkey] = subvalue;
        }

        var stringObj = JSON.stringify(element);
        localStorage.set (lskey, stringObj);
    };
    
    this.replaceAll = function (str, search, replace) {
        //if replace is not sent, return original string otherwise it will
        //replace search string with 'undefined'.
        if (replace === undefined) {
            return str.toString();
        }

        return str.replace(new RegExp('[' + search + ']', 'g'), replace);
    };
    this.getObjectElement = function(object, id, elemKey) {
        var item = '';
        angular.forEach(object, function(value) {
            if (parseInt(value.id) === parseInt(id)) {
                item = value[elemKey];
            }
        });
        return item;
    };
    
    this.getConnection = function() {
        if (window.Connection) {
            if(navigator.connection && navigator.connection.type == Connection.NONE) {
                return false;
            }
        }
        return true;
    };
    
    this.calculateScore = function (lskey, catId, questionArray) {
        var element = localStorage.getObject(lskey);
        var category = localStorage.getObject('category');
        
        var catScore = 0;
        var totalSc = 0;
        var catrisk ='';
        angular.forEach (questionArray, function (value) {
            catScore = catScore + element['answers'][value]['score'];
        });
        element['scores'][catId] = catScore;
        // CATEGORY RISKS
        if (element['scores'][catId] < category [catId-1]['catmedium']) {
            catrisk = 'low risk';
        } else if (element['scores'][catId] >= category [catId-1]['catmedium'] && element['scores'][catId] < category [catId-1]['catmediumlim']) {
            catrisk = 'medium risk'
        } else if (element['scores'][catId] >= category [catId-1]['catmediumlim']) {
            catrisk = 'high risk'
        }
        element['catrisks'][catId] = catrisk;
        angular.forEach(element.scores, function (value,key) {
            totalSc = totalSc + value;
        });
        element['survey']['totalscore']= totalSc;
        var stringObj = JSON.stringify(element);
        localStorage.set (lskey, stringObj);
    };
    
    this.setFuelIndicator = function (lskey, catID){
        var answers = localStorage.getObject(lskey);
        var gaugeDegree = (answers.survey.totalscore * 180)/500;
        var deg = 0 - gaugeDegree;
        var nodID = 'fuelgaugeindicator-'+ catID;
        var fuelIndic = document.getElementById(nodID);
        var rotate = 'rotate('+deg+'deg)';
        if (fuelIndic) {

            fuelIndic.style.webkitTransform = rotate;
            fuelIndic.style.transform = rotate;
        }
    };
})

.service ('answerService', function (){
    this.generateStrucutre = function (questions, vetcode) {
        var answerObject ={};
        var detailobject = {
            "survey": {
                "code": vetcode,
                "user": "",
                "name": "",
                "created": "",
                "totalscore":0,
                "agree": "",
                "horses": 0
            },
            "yard": {
                "yname" : "",
                "yaddress" : "",
                "ycounty"  : "",
                "ycountry" : "England",
                "ypostcode": ""
            },
            "respondent": {
                "yrespondentname" : "",
                "yrespondentemail" : "",
                "yrespondentrole": "Manager/Owner"
            },
            "answers": {},
            "scores": {},
            "catrisks":{}
        };
        var questionObject = {
            "question":0,
            "answer":"",
            "score":0,
            "risk":""
        };
        answerObject  =  detailobject;
        angular.forEach (questions, function (value){
            answerObject['answers'][value.id] = questionObject;
        });
        for (var i = 1; i<= 9; i++) {
            answerObject['scores'][i] = 0;
            answerObject['catrisks'][i] = '';
        }
        return answerObject;
    };
    this.getQuestionObject = function (questions, key, value) {
        var ObjElement = questions[value-1];
        return ObjElement;
    };
    this.getAnswerElement = function (answer, id) {
         item = answer['answers'][id];
        return item;
    };
    this.generateScoresStructure = function (category) {
        angular.forEach(category, function (value, key) {
            value.score = 0;
        });
        return category;
    }
    })
.service ('surveyManagement', function (localStorage){
    // validates data collection
    this.validate = function(answers) {
        var errorList = [];
        var answersList = {};
        var errorMessageList = [
            'FATAL ERROR: Your service has not been authorised by your practice. Make sure you have all authorisation before submitting any survey',
            'The veterinary surgeon’s name/email is incorrect or has not been completed, please check.',
            'You have not agreed with our terms if use. Please tick in order to aknowladger the Terms of use',
            'The yard contact details are not correct. Please check the input data.',
            'is incomplete'
        ];
        angular.forEach (answers, function (value, key) {
            var getError = {};

            if (key === 'survey') {
                if (value.agree === false) {
                    getError.message = errorMessageList[2];
                    getError.slide = 'agree';
                    getError.slideid = null;
                    errorList.push(getError);
                    getError = {};
                }
                // --> check the code
                if (!(value.code)) {
                    getError.message = errorMessageList[0];
                    getError.slide = 'survey';
                    getError.slideid = null;
                    errorList.push(getError);
                    getError = {};
                }
                // --> check user
                if (value.name === "" || value.user === "" || value.horses === "") {
                    getError.message = errorMessageList[1];
                    getError.slide = 'survey';
                    getError.slideid = null;
                    errorList.push(getError);
                    getError = {};
                }


            } else if (key === 'yard') {
                if (value.yname === ""   || value.yaddress === ""  || value.ycounty === ""  || value.ypostcode === "" ) {
                    getError.message = errorMessageList[3];
                    getError.slide = 'yard';
                    getError.slideid = null;
                    errorList.push(getError);
                    getError = {};
                }


            } else if (key === 'respondent') {
                if ( value.yrespondentemail === ""  || value.yrespondentname === ""  || value.yrespondentrole === "" ) {
                    getError.message = errorMessageList[3];
                    getError.slide = 'yard';
                    getError.slideid = null;
                    errorList.push(getError);
                    getError = {};
                }
            }
            else if (key === 'answers') {
                angular.forEach (value, function (val, kkey){
                    if (val.answer === "") {
                        getError.message = errorMessageList[4];
                        getError.slide = kkey;
                        getError.slideid = null;
                        errorList.push(getError);
                        getError = {};
                    }
                });
            }
        });
        return errorList;
    };
        // saves the data in the local storage
    this.save = function (object, param) {
            var messsage = '';
            var today = new Date();
            var lsname = 'survey' +'-'+param+'-'+ object.survey.code +'-'+ today.toString();
            var surveystring = JSON.stringify(object);
            localStorage.set(lsname, surveystring);
            (param === 'complete')? messsage= "Your survey is complete and has been submitted." : messsage= "Let respondents start the assessment now and finish it later. Assessment saved!";

            return messsage;
        }
})
.service ('getSurveyList', function (localStorage){
    //gets data from local storage
    this.complete = function () {
        var listComplete = {};
        for (var key in window.localStorage){
            if(key.indexOf("complete") > -1) {
                var item = localStorage.getObject(key);
                listComplete [key] = item;
                listComplete [key]['unlockKey'] = key;
            }
        }
        return listComplete;
    };
    this.incomplete = function () {
        var listInComplete = {};
        for (var key in window.localStorage){
            if(key.indexOf("partial") > -1) {
                var item = localStorage.getObject(key);
                listInComplete [key] = item;
                listInComplete [key]['unlockKey'] = key;
            }
        }
        return listInComplete;
    }
})
.service ('goService', function ($state, $timeout){
    this.goto = function (path) {
        (typeof (path) != 'string')?$timeout(function() { $state.go("app.single",{ "chapterId": path })}, 500) : $timeout(function() { $state.go(path)}, 500);
    }
})

.controller('LoadCtrl', function($scope, $state, $http, $timeout, $ionicPopup, localStorage, generalService, answerService) {
        $scope.goTo = function(path) { $state.go(path);};
        // REQUEST PARAM
        localStorage.set ('woi', 'progressData');
        localStorage.set ('updateDetails', '');

      $http.defaults.useXDomain = true;
      $http.defaults.headers.common.Authorization = 'Basic bXNkOm1zZDIwMTU=';

      $scope.HTTPrequest = function(url, formdata) {
        // MANAGE RESPOMSES
        $http(
        	{
        		method: 'POST', 
        		url: url, 
        		data: formdata,
        		headers: {
			        'X-APP-TOKEN':'3bfcdf6f-9485-486d-9c31-f739ff74138b'
				},
			}).
            success(function(data) {
              var response = data;
              if (url.indexOf("authenticate") > -1) {
                $scope.processAuthentication (response);
              }
              if (url.indexOf("register") > -1) {
                $scope.processUserRegistration (response);
              }

            }).
            error(function(data, status) {
              $scope.data = data || "Request failed";
              $scope.status = status;
            });
      };
      $scope.showAuthenticationForm = function() {
        if (localStorage.get('unlockKey') != null) {
          $scope.goTo('app.details');
        } else {
          document.getElementById('splash-logo').classList.add('scaledown');
          document.getElementById('container-1').classList.add('hide-visual');
          document.getElementById('container-2').classList.remove('hide');
          document.getElementById('container-2').classList.add('dilay-3s');
          document.getElementById('container-2').classList.add('show-visual');
          $timeout(function() {
            document.getElementById('action-tap-1').classList.add('hide');
            document.getElementById('container-1').classList.add('hide');
          }, 4000);
        }

      };
      $scope.hideContainer2 = function () {
        document.getElementById('container-2').classList.remove('show-visual');
      };
      $scope.showContainer3 = function () {
        document.getElementById('container-3').classList.remove('hide');
        document.getElementById('container-3').classList.add('show-visual');
        $timeout(function() {
          document.getElementById('container-2').classList.add('hide');
          document.getElementById('action-tap-2').classList.remove ('hide');
        }, 2000);
      };
      $scope.hideAuthenticationForm = function () {
        document.getElementById('authform').classList.add('hide-visual');
        $timeout(function() {
          document.getElementById('authform').classList.add('hide');
          $scope.showSetUserForm();
        }, 2000);
      };
      $scope.showSetUserForm = function() {
        document.getElementById('setuserform').classList.remove('hide');
        document.getElementById('setuserform').classList.add('show-visual');
      };
      $scope.checkAuth = function(auth) {
          var checkConnection = generalService.getConnection();
          if (checkConnection) {
                // CHECK CONNECT
              var fData = {};
              var authData = angular.copy(auth);
              if (authData != undefined) {
                  fData.unlockKey = authData.unlockkey;
                  $scope.appKey = authData.unlockkey;
                  $scope.HTTPrequest ('https://services.merck-animal-health.com/kbhh/services/v1/authenticate.json', fData);
              } else {$scope.alertMessage ('Error','Invalid unlock key or practice code. Please check your input!');}
          } else {
              $ionicPopup.confirm({
                  title: 'Internet disconnection',
                  content: 'Sorry, no internet connectivity detected. Please reconnect and try again.'
              })
          }
      };
      $scope.checkUser = function(user) {
        var errorCounter = 0;
        var dataRequest = {};
        dataRequest.unlockKey = localStorage.get('unlockKey');
        dataRequest.users = [];
        var userData = angular.copy(user);
        // process inputs
        angular.forEach (userData, function(value, key){
          var userObj = {
            "role" : '',
            "email" : ''
          };
          if (key === "prime") {
            if (!generalService.email(value)) {
              errorCounter ++;
            } else {
              var string = value;
              userObj.email = string.indexOf(' ') == 0 ? string.substring(1) : string;
              userObj.role = "ROLE_PRIME";
              dataRequest.users.push(userObj);
            }
          } else if (key === "associate") {
            var emails = value.split(',');
            angular.forEach (emails, function (v){
              if (!generalService.email(v)) {
                errorCounter ++;
              } else {
                userObj.role = "ROLE_ASSOCIATE";
                var string = v;
                userObj.email = string.indexOf(' ') == 0 ? string.substring(1) : string;
                dataRequest.users.push(userObj);
                userObj = {
                  "role" : '',
                  "email" : ''
                };

              }
            });
          }

        });
          var checkConnection = generalService.getConnection();
          if (checkConnection) {
              if (errorCounter >0) {
                  $scope.alertMessage ('Error','You have at least one invalid email. Please check and resubmit!');
              } else {
                  $scope.HTTPrequest ('https://services.merck-animal-health.com/kbhh/services/v1/register.json', dataRequest);
              }

          } else {
              $ionicPopup.confirm({
                  title: 'Internet disconnection',
                  content: 'Sorry, no internet connectivity detected. Please reconnect and try again.'
              })
          }

      };
      $scope.processAuthentication = function (response) {
        //Success statuses:
        //    1) SUCCESS
        //    2) SUCCESS:NO_PRIME_USER
        //Error statuses:
        //    1) ERROR:INVALID_KEY
        //    2) ERROR:VET_NOT_FOUND
        //    3) ERROR:VET_AMBIGUOUS
        //    4) ERROR:VET_NOT_ACTIVE

        switch(response.status) {
          case 'ERROR:INVALID_KEY':
          case 'ERROR:VET_NOT_FOUND':
          case 'ERROR:VET_AMBIGUOUS':
            $scope.alertMessage ('Error','Invalid unlock key or practice code. Please check your input!');
            break;
          case 'ERROR:VET_NOT_ACTIVE':
            $scope.alertMessage ('Inactive practice code','Practice inactive. Please contact MSD admin and request your practice activation');
            break;
          case 'SUCCESS':
            $scope.hideContainer2();
            $scope.showContainer3 ();
              if (response.data.vet && response.data.questions) {
                  var jsonVet = JSON.stringify(response.data.vet);
                  localStorage.set('vet', jsonVet);
                  var jsonQuestion = JSON.stringify(response.data.questions);
                  localStorage.set('questions', jsonQuestion);

                  var objectStructure = answerService.generateStrucutre (response.data.questions, response.data.vet.code);
                  var strinStructure = JSON.stringify(objectStructure);
                  localStorage.set ('progressData', strinStructure);


              }
              localStorage.set('unlockKey', $scope.appKey);
            break;
          case 'SUCCESS:NO_PRIME_USER':
            $scope.hideAuthenticationForm ();
              if (response.data.vet && response.data.questions) {
                  var jsonVet2 = JSON.stringify(response.data.vet);
                  localStorage.set('vet', jsonVet2);
                  var jsonQuestion2 = JSON.stringify(response.data.questions);
                  localStorage.set('questions', jsonQuestion2);
              }
              localStorage.set('unlockKey', $scope.appKey);

              var objectStructure2 = answerService.generateStrucutre (response.data.questions, response.data.vet.code);
              var strinStructure2 = JSON.stringify(objectStructure2);
              localStorage.set ('progressData', strinStructure2);
            break;
        }
      };

      $scope.processUserRegistration = function (response) {

        //Success statuses:
        //    1) SUCCESS
        //Error statuses:
        //    1) ERROR:INVALID_KEY
        //    2) ERROR:VET_NOT_FOUND
        //    3) ERROR:VET_AMBIGUOUS
        //    4) ERROR:VET_NOT_ACTIVE
        //    5) ERROR:USER_DATA_EMPTY
        //    6) ERROR:INVALID_USER_DATA
        //    7) ERROR:INVALID_USER_EMAIL
        //    8) ERROR:PRIME_USER_ALREADY_EXISTS
        //    9) ERROR:USER_ALREADY_EXISTS

        switch(response.status) {
          case 'ERROR:INVALID_KEY':
          case 'ERROR:VET_NOT_FOUND':
          case 'ERROR:VET_AMBIGUOUS':
            $scope.alertMessage ('Error','Invalid unlock key or practice code. Please check your input!');

            //code block
            break;
          case 'ERROR:VET_NOT_ACTIVE':
            $scope.alertMessage ('Inactive practice code','Practice inactive. Please contact MSD admin and request your practice activation');
            //code block
            break;
          case 'ERROR:USER_DATA_EMPTY':
          case 'ERROR:INVALID_USER_DATA':
          case 'ERROR:INVALID_USER_EMAIL':
            $scope.alertMessage ('Error','Invalid email(s). Please check and submit!');
            //code block
            break;

          case 'SUCCESS':
            $scope.hideContainer2();
            $scope.showContainer3();

            //code block
            break;
          case 'ERROR:PRIME_USER_ALREADY_EXISTS':
            $scope.alertMessage ('Prime user registered','The prime user has been already registered under another vet practice. Change your prime user email and submit!');
            //code block
            break;
          case 'ERROR:USER_ALREADY_EXISTS':
            $scope.alertMessage ('User registered','User(s) already registered!');
            //code block
            break;
        }
      };
      // POPUP
      // An alert dialog
      $scope.alertMessage = function(title, template) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: template
        });
        alertPopup.then(function(res) {
        });
      };
      // POPUP ENDS

        // localstorage for CATEGORY
        $http.get('hub/assets/category.json').success(function(data){
            //var category = answerService.generateScoresStructure(data) ;
            $scope.jsonCategory = JSON.stringify(data);
            localStorage.set('category', $scope.jsonCategory);
        });

    })
.controller('AppCtrl', function($scope, $state, $window, $ionicModal,$ionicPopup, $timeout, surveyManagement, localStorage, answerService, generalService) {
  
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
        $scope.isAgreed = false;
        $scope.errorCounter = 0;
        $scope.category = localStorage.getObject ('category');
        $scope.newAssesment = function() {
            localStorage.set ('woi', 'progressData');
            var questions = localStorage.getObject ('questions');
            var vet = localStorage.getObject ('vet');

            var objectStructure = answerService.generateStrucutre (questions, vet.code);
            var strinStructure = JSON.stringify(objectStructure);
            localStorage.set ('progressData', strinStructure);
            $scope.isAgreed = false;
        };
        $scope.getTo = function (param) {
            if (param != null) {
                $timeout(function() {  
                    $state.go("app.single",{ "chapterId": param }); 
                }, 500);
                $timeout (function(){$scope.closeSave();}, 900);
            } else {
                $timeout(function() {  
                    $state.go("app.details"); 
                }, 500);
                $timeout (function(){$scope.closeSave();}, 900);
            }
        };
        $scope.saveComplete = function () {
            var wID = localStorage.get ('woi');
            var completeSurvey = localStorage.getObject (wID);
            // set DATA:
            var today = new Date();
            completeSurvey.survey.created = today.toDateString();
            var questionList = localStorage.getObject ('questions');
            $scope.errorList = surveyManagement.validate (completeSurvey);
            $scope.errorCounter = $scope.errorList.length;
            if ($scope.errorCounter>0) {
                angular.forEach($scope.errorList, function(value, key){
                    if (value.slide != 'survey' && value.slide != 'yard' && value.slide != 'respondent') {
                        value.slideid = generalService.getObjectElement(questionList, value.slide, 'categoryName');
                        value.categoryId = generalService.getObjectElement(questionList, value.slide, 'categoryId');
                        value.message ='"'+ generalService.getObjectElement(questionList, value.slide, 'categoryName') + '"' +value.message + ', question: '+ value.slide;
                    };

                });
            } else {
                var completeSumbitionMessage = surveyManagement.save(completeSurvey, 'complete');
                var title = 'Submitted the assessment';
                $scope.showAlert(title, completeSumbitionMessage);


            }
        };
    
        $scope.checkProgress = function () {
            var wID = localStorage.get ('woi');
            var survey = localStorage.getObject (wID);
            $scope.errorList = surveyManagement.validate (survey);
            var questionList = localStorage.getObject ('questions');
            $scope.errorCounter = $scope.errorList.length;
                        if ($scope.errorCounter>0) {
                angular.forEach($scope.errorList, function(value, key){
                    if (value.slide != 'survey' && value.slide != 'yard' && value.slide != 'respondent') {
                        value.slideid = generalService.getObjectElement(questionList, value.slide, 'categoryName');
                        value.categoryId = generalService.getObjectElement(questionList, value.slide, 'categoryId');
                        value.message ='"'+ generalService.getObjectElement(questionList, value.slide, 'categoryName') + '" ' +value.message + ', question: '+ value.slide;
                    };

                });
            } else {
                var completeSumbitionMessage = 'All questions have been answered. Please submit the assessment in order to complete the process';
                var title = ' ';
                $scope.simpleAlert(title, completeSumbitionMessage);

            }
            
        };
    
        $scope.savePartial = function () {
            var woindicator = localStorage.get ('woi');
            var currentSurvey = localStorage.getObject (woindicator);
            // set DATA:
            var today = new Date();
            currentSurvey.survey.created = today.toDateString();
            var completeSumbitionMessage = surveyManagement.save(currentSurvey, 'partial');
            var title = 'Incomplete assessment saved';
            $scope.showAlert(title, completeSumbitionMessage);
        };
        $scope.reset = function () {
            var questions = localStorage.getObject ('questions');
            var vet = localStorage.getObject ('vet');
            // regenerate main object
            var objectStructure3 = answerService.generateStrucutre (questions, vet.code);
            var strinStructure3 = JSON.stringify(objectStructure3);
            localStorage.set ('progressData', strinStructure3);
            // reset repopulate controller
            var controller = localStorage.get ('woi');
            if (controller != 'progressData') {
                window.localStorage.removeItem(controller);
                localStorage.set ('woi', 'progressData');
            }

            $timeout(function() {
                $state.go("app.sync");
            }, 500);
            $timeout (function(){$scope.closeSave();}, 900);

            $scope.errorList ={};
            $scope.errorCounter = 0;

        };

        // An alert dialog
        $scope.showAlert = function(ttl, temps) {
            var alertPopup = $ionicPopup.alert({
                title: ttl,
                template: temps
            });
            alertPopup.then(function(res) {
                $scope.reset();
            });
        };
        // An alert dialog
        $scope.simpleAlert = function(ttl, temps) {
            var alertPopup = $ionicPopup.alert({
                title: ttl,
                template: temps
            });
        };

  // Create the login modal that we will use later

          $ionicModal.fromTemplateUrl('templates/save.html', {
            scope: $scope,
              animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.modal = modal;
          });

          // Triggered in the login modal to close it
          $scope.closeSave = function() {
            $scope.modal.hide();
          };

          // Open the login modal
          $scope.save = function() {
            $scope.modal.show();
              var wID = localStorage.get ('woi');
              $scope.answers = localStorage.getObject (wID);

          };
        $scope.goSubmition = function() {
            $state.go ("app.thankyou");
          };

})
.controller('SurveyCtrl', function($scope, $ionicHistory, localStorage) {
        $scope.$on('$ionicView.enter', function(e) {
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();
        });

  $scope.categoryList = localStorage.getObject ('category');
})
.controller('DetailsCtrl', function($scope, $ionicModal, $ionicSlideBoxDelegate, $ionicPopup, $state, $timeout, $ionicScrollDelegate, $ionicViewSwitcher, $ionicLoading,  localStorage, generalService, goService){
    
        $scope.nextSlide = function() {
            $ionicSlideBoxDelegate.next();
          }
        $scope.prevSlide = function() {
            $ionicSlideBoxDelegate.previous ();
          }
        $scope.newSlide = function ($index) {
            $ionicSlideBoxDelegate.enableSlide(false);
        }
        $scope.slidestop = function(index) {
            $ionicSlideBoxDelegate.enableSlide(false);
        }
        $scope.slidestop();
    // MODAL

        $ionicModal.fromTemplateUrl('templates/termsPops.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });
        // Triggered in the login modal to close it
        $scope.closeTerms = function() {
            generalService.updateLSData($scope.woidicator, "survey", "agree", "true");
            $scope.isAgreed = true;
            $scope.nextSlide();
            $scope.modal.hide();
        };
        // Open the login modal
        $scope.showTerms = function() {
            $scope.modal.show();
        };

        $scope.vet = localStorage.getObject ('vet');
        $scope.formInput = {};
        $scope.goToPage = function(path) {
            goService.goto(path);
        };
        $scope.swipeUp = function () {
            goService.goto(1);
            $ionicScrollDelegate.scrollTop();
        };
        $scope.prepopulate = function (answers) {
            // user data
            var prepopulateSurveyFormData = {};
            var surgeonSurveyFormData = {};
            if (answers.survey.name != "undefined") { surgeonSurveyFormData.name = answers.survey.name; }
            if (answers.survey.user != "undefined") { surgeonSurveyFormData.user = answers.survey.user; }

            if (answers.respondent.yrespondentemail != "undefined") {prepopulateSurveyFormData.yrespondentemail = answers.respondent.yrespondentemail;}
            if (answers.respondent.yrespondentname != "undefined") { prepopulateSurveyFormData.yrespondentname = answers.respondent.yrespondentname; }
            if (answers.yard.yname != "undefined") { prepopulateSurveyFormData.yname = answers.yard.yname;}
            if (answers.yard.yaddress != "undefined") {prepopulateSurveyFormData.yaddress = answers.yard.yaddress;}
            if (answers.yard.ycounty != "undefined") { prepopulateSurveyFormData.ycounty = answers.yard.ycounty;}
            if (answers.yard.ypostcode != "undefined") { prepopulateSurveyFormData.ypostcode = answers.yard.ypostcode;}

            $scope.surveyFormData = angular.copy(prepopulateSurveyFormData);
            $scope.surgeonFormData = angular.copy(surgeonSurveyFormData);

        };
        $scope.show = function() {
              $ionicLoading.show({
                 template: 'Loading...'
            });
        };
        $scope.hide = function(){
            $ionicLoading.hide();
        };
    
    // POPUP
      // An alert dialog
      $scope.alertMessage = function(title, template) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: template
        });
        alertPopup.then(function(res) {
        });
      };
      // POPUP ENDS
    
    
        $scope.getsurgeon = function (surgeonFormData) {
            var surgeonInput = angular.copy(surgeonFormData);
            // error collector
            $scope.checkSubmissionErrorList = {};
            // check for errors
            angular.forEach(surgeonInput, function(value, key) {
                switch(key){
                    case 'name':
                            if(generalService.empty(value) === true) {
                                generalService.updateLSData($scope.woidicator, "survey", key, value);
                            } else {
                                $scope.checkSubmissionErrorList['error'] = 'The veterinary surgeon’s name/ email is incorrect or has not been completed.';          
                            }
                            break;
                    case 'user':
                            if(generalService.email(value) === true) {
                                generalService.updateLSData($scope.woidicator, "survey", key, value);
                            } else {
                                $scope.checkSubmissionErrorList['error'] = 'The veterinary surgeon’s name/ email is incorrect or has not been completed.';          
                            }  
                            break;
                }
            });
            if (generalService.isEmpty($scope.checkSubmissionErrorList)) {
                $scope.nextSlide();
            } else {
                $scope.alertMessage ('Invalid field(s)! Please check', $scope.checkSubmissionErrorList.error);
                
            }
            
            
        }
        $scope.update = function (surveyFormData) {
            $scope.formInput = angular.copy(surveyFormData);
            $scope.updateErrorsList = $scope.updateYard($scope.formInput);            
            if (generalService.isEmpty($scope.updateErrorsList)) {
                $scope.show();
                $timeout(function() { 
                    $state.go("app.single",{ "chapterId": 1 },{reload: true});
                }, 100);
                
            } else {
                $scope.alertMessage ('Invalid field(s)! Please check', $scope.updateErrorsList.error);
                
            }
            
            
        };
    
     $scope.updateYard = function (param) {
             // On leave SET NEW VALUES
            var errorMessage = {};
                angular.forEach (param, function (value, key) {
                    switch(key) {
                        case 'yname':
                        case 'yaddress':
                        case 'ycounty':
                        case 'ycountry':
                        case 'ypostcode':
                            if(generalService.empty(value) === true) {
                                generalService.updateLSData($scope.woidicator, "yard", key, value);
                            } else {
                                errorMessage ['error'] = 'The yard details are incorrect or have not been completed.';          
                            }
                            
                            break;
                        case 'yrespondentemail':
                            if(generalService.email(value) === true) {
                                generalService.updateLSData($scope.woidicator, "respondent", key, value);
                            } else {
                                errorMessage ['error'] = 'The yard details are incorrect or have not been completed.';  
                            }
                            break;
                        case 'yrespondentname':
                        case 'yrespondentrole':
                            if(generalService.empty(value) === true) {
                                generalService.updateLSData($scope.woidicator, "respondent", key, value);
                            } else {
                                errorMessage ['error'] = 'The yard details are incorrect or have not been completed.';          
                            }
                            break;
                    }
                });
            return errorMessage;
        };
        

        // On entry PRE-POPULATE
        $scope.$on('$ionicView.enter', function(e) {
            $scope.slidestop();
            $scope.woidicator = localStorage.get ('woi');
            var answers = localStorage.getObject ($scope.woidicator);
            $scope.prepopulate (answers);
            (answers.survey.agree == 'true')? $scope.isAgreed = true: '';
            $timeout(function() {$scope.hide();},200);
        });

    })
.controller('ChapterCtrl', function($scope, $window, $timeout, $state, $ionicSlideBoxDelegate, $ionicPopup, $stateParams, $ionicViewSwitcher, $ionicScrollDelegate, localStorage, $ionicLoading, generalService, answerService, goService) {
    
        $scope.id = parseInt($stateParams.chapterId);
        $scope.toggles = true; // toggle info
        $scope.togglesbtninput = true;
        $scope.togglesa = true; // additionals
        $scope.togglesbtn = true;
    
        // Selector indicators for multiple selection occurance. This will block further selections when "Nothing"/ "Non" option is selected
        $scope.nonSelected = false;
        $scope.varSelected = false;
    
        $scope.show = function() {
            $ionicLoading.show({
              template: 'Loading...'
            });
        }
    
        // Local storage Data
        $scope.questionsList = localStorage.getObject ('questions');
        var categoryList = localStorage.getObject ('category');
        $scope.category = categoryList[$scope.id-1]['category'];
        ($scope.id<9) ? $scope.prevCategory = categoryList[$scope.id]['category']: $scope.prevCategory = '';
        var questionList = localStorage.getObject ('questions');
        $scope.multipleSelectionRisk = {};
        $scope.multipleSelectionOptions = {};
        // filter / category ID
        $scope.questions = [];
        $scope.qIdList = [];
        angular.forEach (questionList, function (value, key){
            if (value.categoryId == $scope.id){
                $scope.questions.push(value);
                $scope.qIdList.push (value.id);
            }
        });
    
    // POPUP
      // An alert dialog
      $scope.alertMessage = function(title, template) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: template
        });
        alertPopup.then(function(res) {
        });
      };
      // POPUP ENDS
        // set Valid Options
        $scope.options = {};
        angular.forEach ($scope.questions, function(value, key){
            $scope.options[value.id] = generalService.getOptionItem(value);
        });
        
        
        // helping indicators
        $scope.isAnswered = {
            1: false,
            16: false,
            17: false,
            18: false
        };
    $scope.openInputBlock = function (questionId) {
        var inputBlock = 'vresult-'+questionId;
        $scope.isAnswered[questionId] = !$scope.isAnswered[questionId];
        if ($scope.isAnswered[questionId] != true) {
        } else {            
        }
    }
    
        // FUNCTIONS
        $scope.slideHasChanged = function($index){            
            $scope.toggles = true; // toggle info
            $scope.togglesa = true;
            var elementIds1 = 'surveymanager-'+ $scope.id;
            var elementIds2 = 'chapter-area-'+ $scope.id;
            var elementId3 = 'previouse-'+ $scope.id;
            var elementId4 = 'next-'+ $scope.id;
            var elementId5 = 'page-title-'+ $scope.id;
            var elementId6 = 'save-'+ $scope.id;
            var elementId7 = 'end';
            var elementId8 = 'next-section-info';
            var elementId9 = 'swipe-info';
            if($index > 0){
                document.getElementById(elementIds1).classList.remove('hide');
                document.getElementById(elementIds2).classList.remove('hide');
                document.getElementById(elementId4).classList.add('hide');
                document.getElementById(elementId3).classList.add('hide');
                document.getElementById(elementId9).classList.add('hide');
            } if ($index === $ionicSlideBoxDelegate.slidesCount()-1) {
                // What's happending on the last slide??
                document.getElementById(elementIds1).classList.add('hide');
                document.getElementById(elementIds2).classList.add('hide');
                document.getElementById(elementId4).classList.add('hide');
                document.getElementById(elementId8).classList.add('hide');
                ($scope.id != 9)? document.getElementById(elementId4).classList.remove('hide'):'';
                document.getElementById(elementId3).classList.add('hide');
                ($scope.id == 9)? document.getElementById(elementId6).classList.remove('hide'):'';
                ($scope.id == 9)? document.getElementById(elementId7).classList.remove('hide'):'';
                ($scope.id != 9)? document.getElementById(elementId8).classList.remove('hide'): '';
            } else if ($index == 0) {
                document.getElementById(elementIds1).classList.add('hide');
                document.getElementById(elementIds2).classList.add('hide');
                document.getElementById(elementId4).classList.add('hide');
                document.getElementById(elementId8).classList.add('hide');
                document.getElementById(elementId3).classList.remove('hide');
                document.getElementById(elementId5).classList.remove('hide');
                document.getElementById(elementId9).classList.remove('hide');
                
                ($scope.id == 9)? document.getElementById(elementId6).classList.add('hide'):'';
                ($scope.id == 9)? document.getElementById(elementId7).classList.add('hide'):'';
            }
        };
        
    
        $scope.showInfo = function (qid) {
            var inforbtnId = 'infobth-'+qid;
            var infobtn = document.getElementById(inforbtnId);
            
            var aditionalId = 'hidea-'+ qid;
            var aditionalbtn = document.getElementById(aditionalId);
            
            var newinputId = 'hideni-'+qid;
            var newinputbtn = document.getElementById(newinputId);
            
            $scope.toggles = !$scope.toggles;
            $scope.togglesa = true;
            if (!$scope.toggles) {
                var answers = localStorage.getObject ($scope.woidicator);
                $scope.answerIndexes = answerService.getAnswerElement (answers, qid);
                $ionicSlideBoxDelegate.enableSlide(false); 
                infobtn.classList.remove('info');
                infobtn.classList.add('closentn');
                aditionalbtn.classList.remove('hide');
                newinputbtn.classList.remove('hide');
            } else {
                $ionicSlideBoxDelegate.enableSlide(true);
                infobtn.classList.remove('closentn');
                infobtn.classList.add('info');
                aditionalbtn.classList.add('hide');
                newinputbtn.classList.add('hide');
                
            }

        };
        
        $scope.showAditionals = function (qid) {
            var inforbtnId = 'hidei-'+qid;
            var infobtn = document.getElementById(inforbtnId);
            
            var aditionalId = 'aditionals-'+ qid;
            var aditionalbtn = document.getElementById(aditionalId);
            
            var newinputId = 'hideni-'+qid;
            var newinputbtn = document.getElementById(newinputId);
            
            
            $scope.togglesa = !$scope.togglesa;
            $scope.toggles = true;
            if (!$scope.togglesa) {
                
                aditionalbtn.classList.remove('adv');
                aditionalbtn.classList.add('closentn');
                infobtn.classList.remove('hide');
                newinputbtn.classList.remove('hide');
                
                var answers = localStorage.getObject ($scope.woidicator);
                $scope.answerIndexes = answerService.getAnswerElement (answers, qid);
                $ionicSlideBoxDelegate.enableSlide(false);  

            } else {
                aditionalbtn.classList.remove('closentn');
                aditionalbtn.classList.add('adv');
                infobtn.classList.add('hide');
                newinputbtn.classList.add('hide');
                
                $ionicSlideBoxDelegate.enableSlide(true);       
            }

        };
    
        $scope.goPrev = function () {
            if ($scope.id > 1) {
                $scope.show();
                $timeout(function() {
                    goService.goto($scope.id - 1);
                }, 50);
            } else {
                $scope.show();
                $timeout(function() {
                    goService.goto('app.details');
                }, 50);

            }
        };
        
        $scope.goNext = function () {
            if ($scope.id < 9) {
                $scope.show();
                $timeout(function() {
                    goService.goto($scope.id + 1);
                }, 50);
            } else {
                $scope.show();
                $timeout(function() {
                    goService.goto('app.details');
                }, 50);
            }
        };
        $scope.prepopulate = function (qlist) {
            var answers = localStorage.getObject ($scope.woidicator);
            angular.forEach (qlist, function (value){
                if (value.id === 16 || value.id === 17 || value.id === 18 || value.id === 1) {
                    if (answers['answers'][value.id]['question'] != 0) {
                        $scope.isAnswered[value.id] = true;
                        var newinputbtn = 'newinputbtn-'+value.id;
                        document.getElementById(newinputbtn).classList.add('show');
                    }
                }
                var form = 'form-'+value.categoryId;
                if (answers['answers'][value.id]['answer'] != '') {
                    // SET BUTTONS
                    var togglebtn = 'aditionals-'+value.id;
                    if (value.id == 1 || value.id == 17 || value.id == 18 || value.id === 16) {  
                    } 
                    if (value.id == 5) {
                        (answers['answers'][value.id]['answer'] == 4) ? '' : document.getElementById(togglebtn).classList.add('show');  
                    } else if (value.id == 15) {
                        (answers['answers'][value.id]['answer'] == 3) ? '' : document.getElementById(togglebtn).classList.add('show'); 
                    } else {
                        document.getElementById(togglebtn).classList.add('show');
                    }
                    
                    
                    if (value.qType === 2) {
                        var optionID = "q"+value.id+"-option"+answers['answers'][value.id]['answer'];
                        document.forms[form][optionID].checked = true;
                        
                        
                    } else if (value.qType === 1) {
                        document.getElementById(togglebtn).classList.add('show');
                        
                        var cleanString = answers['answers'][value.id]['answer'].substr(1);
                        var optionList = cleanString.split ("%");
                        var multipleOptionObject = {};
                        multipleOptionObject[value.id] = {};
                        $scope.optionListString = '';
                        angular.forEach(optionList, function(v) {
                            var tickedOption = value.id+'-mlt-'+"option"+v;
                            var mtpOp = "option"+v;
                            $scope.optionListString = $scope.optionListString +'.' + mtpOp;
                            multipleOptionObject[value.id][mtpOp] = true;
                            document.forms[form][tickedOption].checked = true;
                            if(answers['answers'][value.id]['risk'] === 1) {$scope.multipleSelectionRisk[value.id] = 'lowrisk';}
                            else if (answers['answers'][value.id]['risk'] === 2){$scope.multipleSelectionRisk[value.id] = 'mediumrisk';}
                            else if (answers['answers'][value.id]['risk'] === 3){$scope.multipleSelectionRisk[value.id] = 'highrisk';}
                            $scope.multipleSelectionForm = multipleOptionObject;
                            
                             
                            
                            });
                        //START BLOCKERS
                                // Which option is a "Nothing"/ "Non"
                                $scope.nonOptionSel = generalService.nonOption(answers['answers'][value.id]['question']);
                                // ENABLE/ DISABLE BLOCKS
                                $scope.enableSelctorBlocks = function () {

                                    if ($scope.optionString === '') {
                                       $scope.nonSelected = false;
                                        $scope.varSelected = false;
                                    } else if ($scope.optionListString.indexOf($scope.nonOptionSel)>-1){

                                        $scope.nonSelected = true;
                                        $scope.varSelected = false;
                                    } else {
                                        $scope.nonSelected = false;
                                        $scope.varSelected = true;
                                    }

                                    $scope.optionListString = '';
                                }

                                $scope.enableSelctorBlocks();
                        // END BLOCKERS
                    }
                }

            });

        };
    // RADIO SELECTORS
        $scope.updateRadioData = function (answerFormData) {
                  
            $scope.radioFeeds = angular.copy(answerFormData);
            // PROCESS RADIO ANSWERS
            angular.forEach ($scope.radioFeeds, function (value, key) {
                var togglebtn = 'aditionals-'+key;
                if ($scope.options[key]['risk'][value.radio] != "na") {
                    document.getElementById(togglebtn).classList.add('show');
                } else {
                    document.getElementById(togglebtn).classList.remove('show');
                }
                // GET ONJECT FROM OBJECT LIST
                var question = answerService.getQuestionObject($scope.questionsList, 'id', key);
                // 1. update answer
                var optionNo = value.radio.slice(-1);
                generalService.updateLSData ($scope.woidicator, key, 'answer', optionNo);
                generalService.updateLSData ($scope.woidicator, key, 'question', key);
                // 2. update score
                var qPoint = 'o'+optionNo+'Points';
                var score = 0;
                (question[qPoint] != null) ? score = question.weight * question[qPoint] : '';
                generalService.updateLSData ($scope.woidicator, key,'score', score);
                generalService.calculateScore ($scope.woidicator, question.categoryId, $scope.qIdList);
                // 3. risk update
                if (score <= question.lowPoints) {
                    generalService.updateLSData ($scope.woidicator, key,'risk', 1);
                } else if (
                    score > question.lowPoints &&
                    score < question.highPoints) {
                    generalService.updateLSData ($scope.woidicator, key,'risk', 2);
                } else if (
                    score >= question.highPoints) {
                    generalService.updateLSData ($scope.woidicator, key,'risk', 3);
                } else if (
                    question[qPoint] == null ) {
                    generalService.updateLSData ($scope.woidicator, key,'risk', 0);
                }
            });
            generalService.setFuelIndicator($scope.woidicator, $scope.id);
        };
    
    
    // UPDATE MULTIPLE SELECTION 
        $scope.processMultipleSelection = function (form) {
            $scope.multipleFeeds = angular.copy(form);
            var answers = localStorage.getObject ($scope.woidicator);
            var currentQuestion;
            angular.forEach ($scope.multipleFeeds, function(value, key) {
                // ADITINALS BUTTON
                var togglebtn = 'aditionals-'+key;
                document.getElementById(togglebtn).classList.add('show');
                
                currentQuestion = key;
                (!($scope.multipleSelectionOptions[key]))? $scope.multipleSelectionOptions[key] = {}:'';
                var question = answerService.getQuestionObject($scope.questionsList, 'id',key);
                
                angular.forEach (value, function (v,k) {
                    $scope.multipleSelectionOptions[key][k] = v;
                });
            });
            var composeOperator = '';
            var score = 0;
            // HERE WE CAN CONTROLE THE FRONT END
            angular.forEach ($scope.multipleSelectionOptions, function (value, key) {
                //START BLOCKERS
                        // Which option is a "Nothing"/ "Non"
                        $scope.nonOption = generalService.nonOption(key);
                        $scope.optionString = '';
                        angular.forEach(value, function (val, ky) {
                            (val === true)? $scope.optionString = $scope.optionString + '.' + ky: '';
                        });

                        // ENABLE/ DISABLE BLOCKS
                        $scope.enableSelctorBlock = function () {

                            if ($scope.optionString === '') {
                               $scope.nonSelected = false;
                                $scope.varSelected = false;
                            } else if ($scope.optionString.indexOf($scope.nonOption)>-1){

                                $scope.nonSelected = true;
                                $scope.varSelected = false;
                            } else {
                                $scope.nonSelected = false;
                                $scope.varSelected = true;
                            }

                            $scope.optionString = '';
                        }

                        $scope.enableSelctorBlock();
                // END BLOCKERS
                if (key === currentQuestion) {
                    var question = answerService.getQuestionObject($scope.questionsList, 'id',key);
                    angular.forEach(value, function (v, k) {
                        var pointsKey = 'o'+ k.slice(-1) + 'Points';
                        if (v === true) {
                           composeOperator = composeOperator + '%' + k.slice(-1);
                           score = score + question.weight * question[pointsKey];
                        }

                    });

                    generalService.updateLSData ($scope.woidicator, key, 'score', score);
                    generalService.updateLSData ($scope.woidicator, key, 'answer', composeOperator);
                    generalService.updateLSData ($scope.woidicator, key, 'question', key);

                    var risk;
//                    Complete
                    if (score <question.lowPoints) {
                        risk = 1;
                        $scope.multipleSelectionRisk[key] = 'lowrisk';
                    } else if ( score >= question.lowPoints && score < question.highPoints) {
                        risk = 2;
                        $scope.multipleSelectionRisk[key] = 'mediumrisk';
                    } else if ( score >= question.highPoints) {
                        risk = 3;
                        $scope.multipleSelectionRisk[key] = 'highrisk';
                    } else {
                    }
                    generalService.updateLSData ($scope.woidicator, key, 'risk', risk);
                    generalService.calculateScore ($scope.woidicator, question.categoryId, $scope.qIdList);
                    composeOperator = '';
                    score = 0;
                }
            });
            generalService.setFuelIndicator($scope.woidicator, $scope.id);

        };
        $scope.vaccination = function (form) {
            var vhorses = angular.copy(form);
            var answers = localStorage.getObject ($scope.woidicator);
            // process data
            var processVaccinData = function (data, answers) {
                var qPoint, score;
                angular.forEach(data, function (value, key) {
                      
                    if (value.horses > answers.survey.horses) {
                        $scope.alertMessage ('OOPS!',"You cannot enter a number higher than the total number of horses in your yard");
                    } else {
                        generalService.updateLSData ($scope.woidicator, key, 'question', key);
                        var prosentage = calculateProcentage (answers.survey.horses, value.horses);
                        if (prosentage <= 49) {
                            pushData (key, 4, 3, 4);
                        } else if (prosentage > 49 && prosentage <= 69) {
                            pushData (key, 3, 2, 4);
                        } else if (prosentage > 69 && prosentage <= 99) {
                            pushData (key, 2, 1, 4);
                        } else {
                            pushData (key, 1, 1, 4);
                        }
                    }
                });
            }
            
            var pushData = function (q, answer, risk, options) {
                
                var question = answerService.getQuestionObject($scope.questionsList, 'id', q);
                generalService.updateLSData ($scope.woidicator, q, 'answer', answer);
                generalService.updateLSData ($scope.woidicator, q, 'risk', risk);
                var qPoint = 'o'+answer+'Points';
                var score = question.weight * question[qPoint];
                generalService.updateLSData ($scope.woidicator, q,'score', score);
                var form = 'form-'+question.categoryId;
                for(var i=1; i<=options; i++) {
                    var ops = "q"+q+"-option"+i;
                    document.forms[form][ops].checked = false;
                }       
                var optionID = "q"+q+"-option"+answer;
                document.forms[form][optionID].checked = true;
                
                
                var boxId = 'vresult-'+q;
               // var domElement = document.getElementById(boxId);
//                document.getElementById(boxId).classList.add('fade-out');
                $scope.isAnswered[q] = !$scope.isAnswered[q];
                // SET BUTTONS
                var togglebtn = 'aditionals-'+q;
                document.getElementById(togglebtn).classList.add('show');
                var newinputbtn = 'newinputbtn-'+q;
                document.getElementById(newinputbtn).classList.add('show');
            }
            
            var calculateProcentage = function (total, indeicator) {
                var calculation = (indeicator/ total)*100;
                return calculation;
            }
            
            var processHorseData = function (data , answers) {
                generalService.updateLSData ($scope.woidicator, 1, 'question', 1);
                generalService.updateLSData($scope.woidicator, "survey", 'horses', data.horses);
                var question = answerService.getQuestionObject($scope.questionsList, 'id', 1);
                if (data.horses <= 4) {
                    pushData (1, 1, 1, 3);
                } else if (data.horses > 4 && data.horses < 11) {
                    pushData (1, 2, 2, 3);
                } else {
                    pushData (1, 3, 3, 3);
                }
            }
            
            //1.  check if number of horses in the yard have been input 
            if (vhorses == undefined) {
                $scope.alertMessage ('OOPS!','No value has been submitted.');
            } else {
                 (vhorses[1])? processHorseData (vhorses[1], answers) : (answers.survey.horses && answers.survey.horses > 0)? processVaccinData(vhorses, answers) : $scope.alertMessage ('No horses in the yard!','This question can not be process. Please make sure you have submited the number of horses in the yard');
            }
           
            
            
            
        }
        $scope.hide = function(){
                $ionicLoading.hide();
              };

        // EVENTS
        $scope.$on('$ionicView.enter', function(e) {
            
            $scope.woidicator = localStorage.get ('woi');
            generalService.setFuelIndicator($scope.woidicator, $scope.id);
            $scope.prepopulate ($scope.questions);
            $timeout(function() {
              $scope.hide(); 
            }, 200);
            
            

        });

        // RESET FORMS
        $scope.resetObj = {};
        $scope.reset = function() {
            $scope.answerFormData = angular.copy($scope.resetObj);
            $scope.multipleFeeds = angular.copy($scope.resetObj);
        };
        $scope.reset();
})
.controller ('SyncCtrl', function ($scope, $http, $timeout, $ionicHistory, $state, getSurveyList, localStorage, $ionicPopup, generalService) {
    $scope.selector = true;
    $scope.toggles = true; // toggle info
    $scope.init = function () {
        $scope.completeItems = getSurveyList.complete();
        $scope.partialItems = getSurveyList.incomplete();
    };
    $scope.$watch(function(scope) { return scope.bindLocalStorage }, function() {
        $scope.init();
        $scope.bindLocalStorage = false;
    });
    $scope.HTTPrequest = function(url, formdata, keyDelete) {
        $scope.newinfo = {};
        // MANAGE RESPOMSES
        $http(
        	{method: 'POST', 
        	url: url, 
        	headers: {
			        'X-APP-TOKEN':'3bfcdf6f-9485-486d-9c31-f739ff74138b'
				},
        	data: formdata}).
            success(function(data) {
                var response = data;
                if (response.status === "SUCCESS") {
                    $scope.bindLocalStorage = true;
                    window.localStorage.removeItem(keyDelete);
                } else if (response.status === "ERROR:USER_IN_ANOTHER_VET" || response.status === "ERROR:USER_IN_ANOTHER_VET" || response.status === "ERROR:INVALID_SURVEY_DATA") {
                    $ionicPopup.show({
                        title: 'Incorrect email',
                        subTitle: 'The vet is registered under another practice or it is invalid',
                        template: 'Please update new vet email',
                        scope: $scope,
                        buttons: [
                          { text: 'Cancel' },
                          {
                            text: '<b>GO</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                localStorage.set ('updateDetails', keyDelete);
                                $state.go("app.newdetails");

                            }
                          }
                        ]
                    })
                } 
                else if (response.status === "ERROR:INVALID_RESPONDENT_DATA" || response.status === "ERROR:INVALID_RESPONDENT_EMAIL") {
                    $ionicPopup.show({
                        title: 'Incorrect email',
                        subTitle: 'The Yard Manager/Owner email is incorrect',
                        template: 'Please enter new Yard Manager/Owner email',
                        scope: $scope,
                        buttons: [
                          { text: 'Cancel' },
                          {
                            text: '<b>GO</b>',
                            type: 'button-positive',
                            onTap: function(e) {
                                localStorage.set ('updateDetails', keyDelete);
                                $state.go("app.newrespondent");

                            }
                          }
                        ]
                    })
                } else {
                    $ionicPopup.show({
                        title: 'Error',
                        subTitle: 'There is an error in data formation',
                        template: 'Please contact your webmaster! This assessment is corrupted. Please create a new assessment',
                        scope: $scope,
                        buttons: [
                          { text: 'Cancel' },
                          {
                            text: '<b>GO</b>',
                            type: 'button-positive',
                            onTap: function(e) {

                            }
                          }
                        ]
                    })
                
                }

            }).
        error(function(data, status) {
                $scope.data = data || "Request failed";
                $scope.status = status;
            });
    };
    $scope.delete = function (item) {
        $ionicPopup.confirm({
                title: 'Delete assessment',
                content: 'Are you sure you wish to permanently delete the assessment'
            }).then (function (res){
                if (res) {
                    window.localStorage.removeItem(item.unlockKey);
                    $scope.bindLocalStorage = true;
                }
            });
        
        
    };
    $scope.edit = function (item) {
        localStorage.set ('woi', item.unlockKey);
        $timeout(function() {
            $state.go("app.details");
            $ionicHistory.clearHistory();
            $ionicHistory.clearCache();

        }, 800);
    };
    $scope.sync = function (item) {
    $scope.sendData = function (item) {
            var keyDelete = item.unlockKey;
            var unlockkey = localStorage.get ('unlockKey');
            item.unlockKey = unlockkey;
            $scope.HTTPrequest ('https://services.merck-animal-health.com/kbhh/services/v1/survey.json', item, keyDelete);
        };
        var checkConnection = generalService.getConnection();
        if (checkConnection) {
            $ionicPopup.confirm({
                title: 'Confirmation',
                content: 'Please confirm assessment submission'
            }).then (function (res){
                if (res) {
                    $scope.sendData (item);
                }
            });
        } else {
            $ionicPopup.confirm({
                title: 'No Internet Connection',
                content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
            })
        }

    };

})
.controller('NewdetailsCtrl', function ($scope, $state, localStorage, generalService) {
    $scope.update = function(form) {
        $scope.newData = angular.copy(form);
        var key = localStorage.get ('updateDetails');
        if ($scope.newData) {
                generalService.updateLSData(key, "survey", 'name', $scope.newData.name);
                generalService.updateLSData(key, "survey", 'user', $scope.newData.user);
                localStorage.set ('updateDetails', '');
                $state.go("app.sync");
            
        }

    }
    
    
})
.controller('NewrespondentCtrl', function ($scope, $state, localStorage, generalService) {
    $scope.updaterespondent = function(form) {
        $scope.newData = angular.copy(form);
        var key = localStorage.get ('updateDetails');
        if ($scope.newData) {
                generalService.updateLSData(key, "respondent", 'yrespondentemail', $scope.newData.user);
                localStorage.set ('updateDetails', '');
                $state.go("app.sync");
            
        }

    }
    
    
})
.controller('ThankyouCtrl', function ($scope, $state, localStorage, generalService) {

    
})
.controller('ListbtnCtrl', function($scope) {
        $scope.shouldShowDelete = true;
        $scope.shouldShowReorder = false;
        $scope.listCanSwipe = false;
    });

