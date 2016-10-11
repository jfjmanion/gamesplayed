javascript:( function(){

     /* more or less stolen form jquery core and adapted by paul irish*/
    function getScript(url,success){
          var script=document.createElement('script');
          script.src=url;
          var head=document.getElementsByTagName('head')[0],
          done=false;
   /* Attach handlers for all browsers*/
           script.onload=script.onreadystatechange = function(){
             if ( !done && (!this.readyState
               || this.readyState == 'loaded'
               || this.readyState == 'complete') ) {
                    done=true;
                    success();
                    script.onload = script.onreadystatechange = null;
                    head.removeChild(script);
             }
          };
      head.appendChild(script);
    }

    if (typeof $=='function') {
        var otherlib=true;
    }
    getScript('https://code.jquery.com/jquery-latest.min.js',function() {
      if (otherlib) {
         jQuery.noConflict();
      }
    });

  function jQuerified($) {
      if (typeof jQuery =='undefined') {
          return;
      } else {
          clearInterval(timer);
          myCode($);
      }
  }

  /*Make sure jquery is loaded before running my code*/
  var timer = setInterval(function(){ jQuerified(jQuery) }, 100);


  function createBox(){
    var el=document.createElement('div');
    el.id = "gamesSummary";
    el.style.position='fixed';
    el.style.marginLeft='-110px';
    el.style.top='0';
    el.style.left='50%';
    el.style.padding='15px';
    el.style.zIndex = 50000000;
    el.style.fontSize='14px';
    el.style.color='#222';
    el.style.backgroundColor='#fff';
    el.setAttribute("id", "hockeyStats");
    return el;
  }

   function getParameterByName(name, url) {
       name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
       var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
           results = regex.exec(url);
       return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
   }

  function sortByKey(array, key) {
    return array.sort(function(a, b) {
    var x = a[key]; var y = b[key];
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  }


  function myCode($){
      /*add styling*/
      $("<style type='text/css'> #hockeyStats td{ padding: 10px;} </style>").appendTo("head");
      /*Get urls for days*/
      var urls = [];
      /*totals for games played*/
      var myTotalCount = 0;
      var yourTotalCount = 0;

      /*totals by day object*/
      var totals = [];

      /*temp object of a single day totals*/
      var temp;

      /*counter for completed ajax requests*/
      var counter = 0;
      var positions = ['C', 'LW', 'RW', 'D'];

      var days = $('#matchup_table div.Grid-u-5-6 ul').children();

      /*don't add matchup totals*/
      days.each(function(i, o){
          if(i !== 0){
          urls[i - 1] = $(this).find('a.Navtarget').attr('href');
          }
      });

      var numDays = urls.length;

      urls.forEach(function(e, i, o) {
          $.ajax({
              method: "GET",
              url: e + "&ajaxrequest=1",

              success: function(response) {

                  var content = response.content;
                  var matchups = $(content).find('#statTable3 tbody').children();
                  var players = $(content).find('#statTable3 tbody tr:first-child').children();
                  var breakpoint = players.length / 2;
                  var myCount = 0;
                  var yourCount = 0;

                  /*loop rows*/
                  matchups.each(function(index, o){
                      /*make sure they are actually playing this week*/
                      if ($.inArray($(this).find('td.Bg-shade').children('div').children('span').html(), positions) > -1){
                          /*loop tds*/
                          $(this).children().each(function(index, out){
                              if ($(this).find('a.F-reset').length > 0){
                                  if (index > breakpoint){
                                      yourTotalCount++;
                                      yourCount++;
                                  } else {
                                      myTotalCount++;
                                      myCount++;
                                  }
                              }
                          });
                      }
                  });

              /*get the date of the current request*/
              var date = getParameterByName('date', e);
              /*all rows are counted, add them to the array with the date as the index*/
              temp = {};
              temp['date'] = date;
              temp['myCount'] = myCount;
              temp['yourCount'] = yourCount;

              totals.push(temp);
              counter++;

              /*if all requests have completed*/
              if (counter == numDays){
                totals = sortByKey(totals, 'date');
                /* loop through the days $date => $values*/
                var today = new Date();
                /*remove a day to include today*/
                var day = today.getDate() - 1;
                today.setDate(day);
                today = today.valueOf();
                var myRemainingTotal = 0;
                var yourRemainingTotal = 0;

                /*create the output table*/
                var table = document.createElement('table');
                var row = table.insertRow();
                $(row).css('font-weight', 'bold');
                $(row).css('fontSize', '16px');
                row.insertCell(0).innerHTML = "Date";
                row.insertCell(1).innerHTML = "My Players";
                row.insertCell(2).innerHTML = "Their Players";

                totals.forEach(function(e, i, o) {
                  row = table.insertRow();
                  /*if the iteration is less than the current day - superstrike and don't add to the remaining total*/
                   var matchupDate = new Date(e.date);
                   if (matchupDate.valueOf() < today){
                     /*strikethrough and don't add to remaining total*/
                     $(row).css('text-decoration', 'line-through');

                   } else {
                     /*add to total remaining*/
                     myRemainingTotal += e.myCount;
                     yourRemainingTotal += e.yourCount;
                   }

                   row.insertCell(0).innerHTML = e.date;
                   row.insertCell(1).innerHTML = e.myCount;
                   row.insertCell(2).innerHTML = e.yourCount;

                });
                /*spacer*/
                row = table.insertRow();
                row.insertCell(0).innerHTML = "Total Games";
                row.insertCell(1).innerHTML = myTotalCount;
                row.insertCell(2).innerHTML = yourTotalCount;

                row = table.insertRow();
                row.insertCell(0).innerHTML = "Total Games<br/>Remaining";
                row.insertCell(1).innerHTML = myRemainingTotal;
                row.insertCell(2).innerHTML = yourRemainingTotal;
                $(row).css('font-weight', 'bold');
                $(row).css('fontSize', '16px');

                el = createBox();

                var button=document.createElement('button');
                button.innerHTML = "X";
                button.id = "closeGames";
                button.style.float = "right";
                button.style.backgroundColor = "white";
                button.style.border = "1px black solid";
                el.appendChild(button);
                el.appendChild(table);
                var b=document.getElementsByTagName('body')[0];
                b.appendChild(el);
              }
            }
          });
        });
    }

    /*set the close button function when it exists*/
    function gamesExist() {
      var games = document.getElementById('closeGames');
      if (games == null) {
          return;
      } else {
          clearInterval(timer2);
          document.getElementById('closeGames').onclick=function(){ var element=document.getElementById('hockeyStats'); element.parentNode.removeChild(element);}
      }
    }
    var timer2 = setInterval(function(){ gamesExist() }, 1000);
})();