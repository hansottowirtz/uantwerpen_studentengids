(function() {
  Studentengids.directive('checkOverflow', [
    '$timeout', 'OverflowFactory', function($timeout, OverflowFactory) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var check, child_block, object, only_block, parent_block;
          parent_block = element[0];
          child_block = element[0].querySelector('.child-element');
          if (!child_block) {
            throw new Error('no child element');
          }
          only_block = (attrs['checkOverflowOptions'] || '').split(' ').indexOf('only_block') !== -1;
          object = scope.$eval(attrs['checkOverflowObject']);
          check = function() {
            if (!OverflowFactory[attrs['checkOverflowType']].expanded) {
              object._block_height = parent_block.clientHeight;
              if (parent_block.clientHeight <= child_block.clientHeight) {
                element.addClass('overflowed');
                if (!only_block) {
                  object._child_height = child_block.clientHeight;
                }
                object._overflowed = true;
              } else {
                element.removeClass('overflowed');
                object._overflowed = false;
              }
            }
          };
          element.bind('ready transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', check);
          return OverflowFactory.all_checks.push(check);
        }
      };
    }
  ]);

  Studentengids.directive('scrollBackground', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var background_el, bla;
          if (!(window.scrollY || window.scrollY === 0)) {
            return;
          }
          background_el = angular.element(element.children()[1]);
          console.log(background_el);
          bla = function() {
            var pixels, speed;
            console.log('alo', window.scrollY);
            speed = 2;
            if (window.scrollY > window.innerHeight) {
              pixels = window.innerHeight / speed;
            } else {
              pixels = window.scrollY / speed;
            }
            return background_el.css('transform', "translate3d(0, " + pixels + "px, 0)");
          };
          return angular.element(window).bind('scroll', bla);
        }
      };
    }
  ]);

  Studentengids.factory('OverflowFactory', [
    '$timeout', '$interval', function($timeout, $interval) {
      var OF;
      OF = {
        _last_time: Date.now(),
        doAllChecks: function() {
          if (Date.now() - OF._last_time > 500) {
            OF._last_time = Date.now();
            angular.forEach(OF.all_checks, function(fn) {
              return fn();
            });
            return $timeout(OF.doAllChecks, 400);
          }
        },
        all_checks: [],
        clubs_text: {
          expanded: false
        },
        campus_text: {
          expanded: false
        },
        campus_photos: {
          expanded: false
        }
      };
      $timeout(OF.doAllChecks, 1000);
      $interval(OF.doAllChecks, 5000);
      angular.element(window).bind('resize', OF.doAllChecks);
      return OF;
    }
  ]);

  Studentengids.controller('StudentengidsController', [
    '$scope', '$sce', '$window', '$timeout', 'OverflowFactory', function($scope, $sce, $window, $timeout, OverflowFactory) {
      var orientationEvent, supportsOrientationChange;
      window.$scope = $scope;
      $timeout(function() {
        return angular.element(window).bind('resize', function() {
          if ($scope.$apply) {
            return $scope.$apply();
          }
        });
      }, 1000);
      $scope.Layout = {
        getViewportHeightStyle: function() {
          if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            return {
              height: $scope.Layout.first_viewport_height + "px"
            };
          } else {

          }
        },
        first_viewport_height: $window.innerHeight
      };
      supportsOrientationChange = 'onorientationchange' in $window;
      orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';
      $window.addEventListener(orientationEvent, (function() {
        $scope.Layout.first_viewport_height = $window.innerWidth;
      }), false);
      $scope.Education = {
        changedFaculty: function() {
          console.log($scope.Education.selected_faculty);
          $window.localStorage.setItem('selected_faculty', $scope.Education.faculties.indexOf($scope.Education.selected_faculty));
          return $window.localStorage.setItem('selected_club', $scope.Clubs.i = $scope.Education.selected_faculty.club_index);
        },
        faculties: [
          {
            name: 'Farmaceutische, Biomedische en Diergeneeskundige wetenschappen',
            main_campuses: ['PM', 'ST', 'H', 'M'],
            club: 'Diefka',
            club_index: 10
          }, {
            name: 'Ontwerpwetenschappen',
            main_campuses: [],
            club: 'PoStuRa',
            club_index: 23
          }, {
            name: 'Toegepaste Economische Wetenschappen',
            main_campuses: [],
            club: 'Wikings-NSK',
            club_index: 34
          }, {
            name: 'Geneeskunde en Gezondheidswetenschappen',
            main_campuses: [],
            club: 'Aesculapia',
            club_index: 1
          }, {
            name: 'Rechten',
            main_campuses: [],
            club: 'Sofia',
            club_index: 29
          }, {
            name: 'Toegepaste Ingenieurswetenschappen',
            main_campuses: [],
            club: 'Vulcanis',
            club_index: 33
          }, {
            name: 'Letteren en Wijsbegeerte',
            main_campuses: [],
            club: 'Lingua',
            club_index: 21
          }, {
            name: 'Sociale Wetenschappen',
            main_campuses: [],
            club: 'PSW',
            club_index: 26
          }, {
            name: 'Wetenschappen',
            main_campuses: []
          }
        ],
        selected_faculty: null
      };
      $scope.Campuses = {
        expanded: false,
        i: 0,
        getContentStyle: function() {
          return {
            'margin-left': -$scope.Campuses.i * 100 + '%'
          };
        },
        isExpanded: function() {
          return OverflowFactory.campus_text.expanded;
        },
        isPhotosExpanded: function() {
          return OverflowFactory.campus_photos.expanded;
        },
        getCurrent: function() {
          var current_club;
          current_club = $scope.Campuses.campuses[$scope.Campuses.i];
          return current_club;
        },
        toggleExpanded: function(campus) {
          if (campus !== $scope.Campuses.getCurrent()) {
            return;
          }
          if (!campus._overflowed) {
            OverflowFactory.campus_text.expanded = false;
            return;
          }
          return OverflowFactory.campus_text.expanded = !OverflowFactory.campus_text.expanded;
        },
        togglePhotosExpanded: function(campus) {
          if (campus !== $scope.Campuses.getCurrent()) {
            return;
          }
          console.log('togglePhotosExpanded');
          return OverflowFactory.campus_photos.expanded = !OverflowFactory.campus_photos.expanded;
        },
        clickedPrevious: function() {
          var current_club;
          current_club = $scope.Campuses.getCurrent();
          $scope.Campuses.i--;
          OverflowFactory.campus_text.expanded = false;
          OverflowFactory.campus_photos.expanded = false;
          if ($scope.Campuses.i < 0) {
            return $scope.Campuses.i = $scope.Campuses.campuses.length - 1;
          }
        },
        clickedNext: function() {
          var current_club;
          current_club = $scope.Campuses.getCurrent();
          $scope.Campuses.i++;
          OverflowFactory.campus_text.expanded = false;
          OverflowFactory.campus_photos.expanded = false;
          if ($scope.Campuses.i > $scope.Campuses.campuses.length - 1) {
            return $scope.Campuses.i = 0;
          }
        },
        campuses: [
          {
            name: 'Stadscampus <u>ST</u>, Campus Paardenmarkt <u>PM</u> en Campus Mutsaard <u>MU</u>',
            text: 'Deze campussen liggen zo dicht bij elkaar dat we ze hier samen nemen. Zoals je kan zien is de Stadscampus niet een groot gebouw, maar liggen de gebouwen soms redelijk ver uit elkaar. De Campus Paardenmarkt en de Campus Mutsaard zijn aparte campussen omdat deze vroeger van de hogeschool waren. Voor jullie zijn vooral gebouw R en de gebouwen van de Paardenmarkt hier van belang. Deze drie campussen zijn de binnencampussen, de rest zijn buitencampussen.' + 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            map_link: 'https://goo.gl/maps/DTx8gn9sT5E2',
            external_link: 'https://www.uantwerpen.be/nl/campusleven/op-weg-naar-de-campus/stadscampus-paardenmarkt-mutsaard/',
            photos: [
              {
                link: 'https://www.uantwerpen.be/images/uantwerpen/container1161/files/Kaartpdf_stadscampus.pdf',
                source: 'assets/kaart_stadscampus.jpg'
              }, {
                link: null,
                source: 'assets/hof_van_liere2.jpg'
              }
            ],
            _photos_overflow: {}
          }, {
            name: 'Campus Drie Eiken <u>D</u>',
            text: '',
            map_link: 'https://goo.gl/maps/yoKT8nVuKKo',
            external_link: 'https://www.uantwerpen.be/nl/campusleven/op-weg-naar-de-campus/campus-drie-eiken/',
            photos: [
              {
                link: 'https://www.uantwerpen.be/images/uantwerpen/container1161/files/Kaartpdf_drieeiken.pdf',
                source: 'assets/kaart_drie_eiken.jpg'
              }
            ],
            _photos_overflow: {}
          }, {
            name: 'Campus Middelheim <u>M</u>',
            text: 'Deze campus ligt in Wilrijk.',
            map_link: 'https://goo.gl/maps/D6xJxXEgY3p',
            external_link: 'https://www.uantwerpen.be/nl/campusleven/op-weg-naar-de-campus/campus-middelheim/',
            photos: [
              {
                link: 'https://www.uantwerpen.be/images/uantwerpen/container1161/files/CMI_02_CMYK_14.pdf',
                source: 'assets/kaart_middelheim.jpg'
              }
            ],
            _photos_overflow: {}
          }, {
            name: 'Campus Groenenborger <u>G</u>',
            text: '',
            map_link: 'https://goo.gl/maps/DTx8gn9sT5E2',
            external_link: 'https://www.uantwerpen.be/nl/campusleven/op-weg-naar-de-campus/campus-groenenborger/',
            photos: [
              {
                link: 'https://www.uantwerpen.be/images/uantwerpen/container1161/files/Kaartpdf_Groenenborger.pdf',
                source: 'assets/kaart_groenenborger.jpg'
              }
            ],
            _photos_overflow: {}
          }, {
            name: 'Campus Hoboken <u>H</u>',
            text: '',
            map_link: 'https://www.google.com/maps/place//@51.17364,4.37037,14z/',
            external_link: 'https://www.uantwerpen.be/nl/campusleven/op-weg-naar-de-campus/campus-hoboken/',
            photos: [
              {
                link: 'https://www.uantwerpen.be/images/uantwerpen/container1161/files/kaartpdf_campusHoboken.pdf',
                source: 'assets/kaart_hoboken.jpg'
              }
            ],
            _photos_overflow: {}
          }, {
            name: 'Campus Zuid <u>Z</u>',
            text: '',
            map_link: 'https://www.google.com/maps/place//@51.20852,4.396849,14z/',
            external_link: 'https://www.uantwerpen.be/nl/campusleven/op-weg-naar-de-campus/campus-zuid/',
            photos: [
              {
                link: 'https://www.uantwerpen.be/images/uantwerpen/container1161/files/kaartpdf_campusZuid.pdf',
                source: 'assets/kaart_zuid.jpg'
              }
            ],
            _photos_overflow: {}
          }, {
            name: 'Campus Merksem <u>ME</u>',
            text: '',
            map_link: 'https://www.google.com/maps/place//@51.24561,4.445472,14z/',
            external_link: 'https://www.uantwerpen.be/nl/campusleven/op-weg-naar-de-campus/campus-merksem/',
            photos: [
              {
                link: 'https://www.uantwerpen.be/images/uantwerpen/container1161/files/Kaartpdf_campusMerksem.pdf',
                source: 'assets/kaart_merksem.jpg'
              }
            ],
            _photos_overflow: {}
          }
        ]
      };
      $scope.Timer = {
        i: 0
      };
      setInterval(function() {
        return $scope.Timer.i++;
      }, 2000);
      $scope.Clubs = {
        i: 0,
        isExpanded: function() {
          return OverflowFactory.clubs_text.expanded;
        },
        getCurrent: function() {
          var current_club;
          current_club = $scope.Clubs.clubs[$scope.Clubs.i];
          return current_club;
        },
        toggleExpanded: function(club) {
          var current_club;
          console.log('toggling expanded');
          current_club = $scope.Clubs.getCurrent();
          if (club !== current_club) {
            return;
          }
          if (!club._style.text_box._overflowed) {
            OverflowFactory.clubs_text.expanded = false;
            return;
          }
          return OverflowFactory.clubs_text.expanded = !OverflowFactory.clubs_text.expanded;
        },
        getContentStyle: function() {
          return {
            'margin-left': -$scope.Clubs.i * 100 + '%'
          };
        },
        clickedPrevious: function() {
          var current_club;
          current_club = $scope.Clubs.getCurrent();
          $scope.Clubs.i--;
          OverflowFactory.clubs_text.expanded = false;
          if ($scope.Clubs.i < 0) {
            $scope.Clubs.i = $scope.Clubs.clubs.length - 1;
          }
          return $window.localStorage.setItem('selected_club', $scope.Clubs.i);
        },
        clickedNext: function() {
          var current_club;
          current_club = $scope.Clubs.getCurrent();
          $scope.Clubs.i++;
          OverflowFactory.clubs_text.expanded = false;
          if ($scope.Clubs.i > $scope.Clubs.clubs.length - 1) {
            $scope.Clubs.i = 0;
          }
          return $window.localStorage.setItem('selected_club', $scope.Clubs.i);
        },
        clubs: [
          {
            name: 'Aesculapia',
            image_source: 'assets/studentenclubs/aesculapia.png',
            description: '',
            department: 'Geneeskunde',
            stamcafe: {
              name: 'De Buis',
              google_maps_link: ''
            },
            website: 'aesculapia.be',
            facebook_link: 'https://www.facebook.com/aesculapia'
          }, {
            name: 'Abundantia',
            image_source: 'assets/studentenclubs/abundantia.jpg',
            description: '',
            stamcafe: {
              name: 'De Salamander (De Sali)',
              google_maps_link: ''
            },
            website: 'abundantia.be',
            notable: 'Duveldrinkers',
            facebook_link: 'https://www.facebook.com/Abundantia-Antwerpen-1508101279508854'
          }, {
            name: 'AIESEC',
            image_source: 'assets/studentenclubs/aiesec.png',
            description: '',
            website: 'aiesecua.be',
            notable: 'Leiderschapsontwikkeling (Internationaal)',
            facebook_link: 'https://www.facebook.com/ua.aiesec'
          }, {
            name: 'Biomedica',
            image_source: 'assets/studentenclubs/biomedica.png',
            description: '',
            department: 'Biomedische wetenschappen',
            website: 'biomedica.be',
            facebook_link: 'https://www.facebook.com/BiomedicaAntwerpen'
          }, {
            name: 'De Chips',
            image_source: 'assets/studentenclubs/chips.png',
            description: '',
            stamcafe: {
              name: 'De Schacht',
              google_maps_link: ''
            },
            website: 'vaneerdt.be/wp/nieuws',
            notable: 'Kotstudenten',
            facebook_link: 'https://www.facebook.com/DeChipsKotstudenten'
          }, {
            name: 'Conservamus',
            image_source: 'assets/studentenclubs/conservamus.png',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ',
            department: 'Conservatie en restoratie',
            website: 'www.facebook.com/conservamus.antwerpen',
            facebook_link: 'https://www.facebook.com/conservamus.antwerpen'
          }, {
            name: 'Campinaria',
            image_source: 'assets/studentenclubs/campinaria.png',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ',
            website: 'campinaria.be',
            notable: 'Kot- en homestudenten',
            facebook_link: 'https://www.facebook.com/Campinaria'
          }, {
            name: 'Demetris',
            image_source: 'assets/studentenclubs/demetris.png',
            description: '',
            department: 'Bio-ingenieurs',
            website: 'demetris-ua.be'
          }, {
            name: 'Diefka',
            image_source: 'assets/studentenclubs/diefka.png',
            description: '',
            department: 'Diergeneeskundige wetenschappen',
            website: 'diefka.com',
            facebook_link: 'https://www.facebook.com/DIEFKAntwerpen'
          }, {
            name: 'De Flamingo\'s',
            image_source: 'assets/studentenclubs/de_flamingos.jpg',
            description: '',
            notable: 'Holebi-studenten',
            website: 'studentenclubdeflamingos.be',
            facebook_link: 'https://www.facebook.com/studentenclubdeflamingos'
          }, {
            name: 'EESTEC',
            image_source: 'assets/studentenclubs/eestec.svg',
            description: '',
            department: 'Informatica (Europees)',
            website: 'eestec.be',
            facebook_link: 'https://www.facebook.com/EESTEC'
          }, {
            name: 'ELSA',
            image_source: 'assets/studentenclubs/elsa.gif',
            description: '',
            department: 'Rechten (Europees)',
            website: 'elsa.org',
            facebook_link: 'https://www.facebook.com/elsa.antwerp'
          }, {
            name: 'EMSA',
            image_source: 'assets/studentenclubs/emsa.jpg',
            description: '',
            department: 'Geneeskunde (Europees)',
            website: 'emsa.be',
            facebook_link: 'https://www.facebook.com/EMSAAntwerpen'
          }, {
            name: 'Fabiant',
            image_source: 'assets/studentenclubs/fabiant.png',
            description: '',
            department: 'Biologie',
            website: 'fabiant.be',
            facebook_link: 'https://www.facebook.com/Fabiantisgroot'
          }, {
            name: 'KDA',
            image_source: 'assets/studentenclubs/kda.png',
            description: '',
            department: 'Chemie en biochemie',
            website: 'uakda.be',
            facebook_link: 'https://www.facebook.com/KringDerAlchemisten'
          }, {
            name: 'IMBIT',
            image_source: 'assets/studentenclubs/imbit.jpg',
            description: '',
            department: 'Handelsingenieur in de beleidsinformatica',
            website: 'imbit.org',
            facebook_link: 'https://www.facebook.com/imbit.antwerpen'
          }, {
            name: 'Klio',
            image_source: 'assets/studentenclubs/klio.png',
            description: '',
            department: 'Geschiedenis',
            website: 'klio.be',
            facebook_link: 'https://www.facebook.com/Klio-Departementsclub-Geschiedenis-153130011539957'
          }, {
            name: 'Kinesia',
            image_source: 'assets/studentenclubs/kinesia.png',
            description: '',
            department: 'Revalidatiewetenschappen en kinesitherapie',
            website: 'www.studentenclubkinesia.be',
            facebook_link: 'https://www.facebook.com/kinesia.antwerpen'
          }, {
            name: 'Lingua',
            image_source: 'assets/studentenclubs/lingua.jpg',
            description: '',
            department: 'Taal- en letterkunde',
            website: 'www.lingua-ua.be',
            facebook_link: 'https://www.facebook.com/Lingua-189658387790230'
          }, {
            name: 'Modulor',
            image_source: 'assets/studentenclubs/modulor.jpg',
            description: '',
            department: 'Architectuur en interieurarchitectuur',
            website: 'modulor.me',
            facebook_link: 'https://www.facebook.com/modulor.antwerpen'
          }, {
            name: 'Óðinn',
            image_source: 'assets/studentenclubs/odinn.jpg',
            description: '',
            notable: 'Mannenclub',
            website: 'odinn.be',
            facebook_link: 'https://www.facebook.com/odinnUA'
          }, {
            name: 'Hera',
            image_source: 'assets/studentenclubs/hera.png',
            description: '',
            notable: 'Vrouwenclub',
            website: null,
            facebook_link: 'https://www.facebook.com/Hera-374031099344183'
          }, {
            name: 'Prisma',
            image_source: 'assets/studentenclubs/prisma.jpg',
            description: '',
            notable: 'Solidair met studenten',
            website: 'ua-prisma.be',
            facebook_link: 'https://www.facebook.com/ua.prisma'
          }, {
            name: 'PSW',
            image_source: 'assets/studentenclubs/psw.png',
            description: '',
            department: 'Sociale wetenschappen',
            website: 'psw.be',
            facebook_link: 'https://www.facebook.com/pswantwerpen'
          }, {
            name: 'Praesidium Ten Prinsenhove',
            image_source: 'assets/studentenclubs/ptp.jpg',
            description: '',
            notable: 'Studentenhome Ten Prinsenhove',
            website: 'club.studiant.be/ptp/',
            facebook_link: 'https://www.facebook.com/praesidium.tenprinsenhove.7'
          }, {
            name: 'Vulcanis',
            image_source: 'assets/studentenclubs/vulcanis.gif',
            description: '',
            department: 'Industriële ingenieurs',
            stamcafe: {
              name: 'De Prof',
              google_maps_link: ''
            },
            website: 'vulcanis.be',
            facebook_link: 'https://www.facebook.com/VulcanisAntwerpen'
          }, {
            name: 'Socio Economica',
            image_source: 'assets/studentenclubs/socio_economica.png',
            description: '',
            department: 'Sociaal-economische wetenschappen',
            website: 'socioeconomica.be',
            facebook_link: 'https://www.facebook.com/SocioEconomica.UA'
          }, {
            name: 'Sofia',
            image_source: 'assets/studentenclubs/sofia.jpg',
            description: '',
            department: 'Rechten',
            website: 'sofia.be',
            facebook_link: 'https://www.facebook.com/Sofia-Antwerp-248736418506140'
          }, {
            name: 'PoStuRa',
            image_source: 'assets/studentenclubs/postura.jpg',
            description: '',
            department: 'Productontwikkeling',
            website: 'postura.be',
            facebook_link: 'https://www.facebook.com/studentenraadPO'
          }, {
            name: 'UFKA',
            image_source: 'assets/studentenclubs/ufka.png',
            description: '',
            department: 'Farmaceutische wetenschappen',
            website: 'ufka.eu',
            facebook_link: 'https://www.facebook.com/UniversitaireFarmaceutischeKringAntwerpen'
          }, {
            name: 'Translatio',
            image_source: 'assets/studentenclubs/translatio.png',
            description: '',
            department: 'Toegepaste taalkunde',
            website: 'clubtranslatio.be',
            facebook_link: 'https://www.facebook.com/studentenclub.translatio'
          }, {
            name: 'Wikings-NSK',
            image_source: 'assets/studentenclubs/wikings_nsk.png',
            description: '',
            department: 'TEW, HI(B) en SEW',
            website: 'wikings.be',
            facebook_link: 'https://www.facebook.com/wikings.antwerp'
          }, {
            name: 'WINAK',
            image_source: 'assets/studentenclubs/winak.png',
            description: '',
            department: 'Wiskunde, Informatica en Natuurkunde',
            website: 'winak.be',
            facebook_link: 'https://www.facebook.com/WINAKantwerpen'
          }, {
            name: 'Unifac',
            image_source: 'assets/studentenclubs/unifac.jpg',
            description: '',
            notable: 'Overkoepelend, binnencampussen',
            website: 'unifac.be',
            facebook_link: 'https://www.facebook.com/Unifac.vzw',
            stamcafe: {
              name: 'De Visbokaal',
              google_maps_link: ''
            }
          }, {
            name: 'ASK-Stuwer',
            image_source: 'assets/studentenclubs/ask_stuwer.png',
            description: '',
            notable: 'Overkoepelend, buitencampussen',
            website: 'ask-stuwer.be',
            facebook_link: 'https://www.facebook.com/Ask-Stuwer-676387159066322'
          }, {
            name: 'Andoverpia',
            image_source: 'assets/studentenclubs/andoverpia.jpg',
            description: '',
            notable: 'Regio Antwerpen',
            website: 'andoverpia.be',
            facebook_link: 'https://www.facebook.com/Andoverpia'
          }, {
            name: 'Nordkempus',
            image_source: 'assets/studentenclubs/nordkempus.jpg',
            description: '',
            notable: 'Regio Kempen',
            facebook_link: 'https://www.facebook.com/nordkempus.antwerpen'
          }
        ].sort(function(a, b) {
          var nameA, nameB;
          nameA = a.name.toLowerCase();
          nameB = b.name.toLowerCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          } else {
            return 0;
          }
        })
      };
      $scope.Education.selected_faculty = (function() {
        var index;
        if ($window.localStorage) {
          index = $window.localStorage.getItem('selected_faculty');
          if (angular.isNumber(index * 1)) {
            console.log($scope.Education.faculties[index * 1]);
            return $scope.Education.faculties[index * 1];
          } else {
            return null;
          }
        } else {
          return null;
        }
      })();
      $scope.Clubs.i = $window.localStorage ? $window.localStorage.getItem('selected_club') * 1 || 0 : 0;
      Mousetrap.bind('left', function() {
        $scope.Clubs.clickedPrevious();
        $scope.Campuses.clickedPrevious();
        return $scope.$apply();
      });
      Mousetrap.bind('right', function() {
        $scope.Clubs.clickedNext();
        $scope.Campuses.clickedNext();
        return $scope.$apply();
      });
      return angular.forEach($scope.Clubs.clubs, function(club, i) {
        return club._style = {
          info_box: {},
          text_box: {}
        };
      });
    }
  ]);

  Studentengids.filter('sanitize', [
    '$sce', function($sce) {
      return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
      };
    }
  ]);

}).call(this);
