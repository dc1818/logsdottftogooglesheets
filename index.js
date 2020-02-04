const express = require('express');
const app = express();
const rp = require('request-promise');
const cheerio = require('cheerio');
const port = process.env.port || 3000;
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
let url;
let dom;
let logName;
let names;
let logMap;
let logLength;
let date;
let blueScore;
let redScore;
let players;
let htmlData;
let values=[];
let request=null;
let dataTemplate =[];
let dataTemplateArrays=[];
let teamname;


var sheets = google.sheets('v4');

app.use(express.static('public'));




var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly',"https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/spreadsheets"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback,req) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
      //console.log(req);
      auth = oAuth2Client;
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) =>
  {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client,req);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) =>
  {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

function appendToSheet(oAuth2Client)
{
  request.auth = oAuth2Client;
  //console.log(request);
  console.log("add data to sheet");






 sheets.spreadsheets.values.append(request, function(err, response) {
   if (err) {
     console.error(err);
     return;
   }

   // TODO: Change code below to process the `response` object:
   //console.log(JSON.stringify(response, null, 2));
 });
}
function createArrays()
{
    console.log("create array");

    console.log(JSON.stringify(dataTemplate[0].values));
  let keys=[];
  let arr =[];
  let name;

  request = {
   // The ID of the spreadsheet to update.
   spreadsheetId: '1usgRC4_OfsnViMrDI_coagrMp5QdXb3Kjllj4Iu6YZE',  // TODO: Update placeholder value.

   // The A1 notation of a range to search for a logical table of data.
   // Values will be appended after the last row of the table.
   range: 'A1',  // TODO: Update placeholder value.

   // How the input data should be interpreted.
   valueInputOption: 'RAW',  // TODO: Update placeholder value.

   // How the input data should be inserted.
   insertDataOption: 'INSERT_ROWS',  // TODO: Update placeholder value.

   resource:
   // TODO: Add desired properties to the request body.
     {
       "majorDimension": "ROWS",
       "values":[
         ["asdasd"]
       ]
     },
  auth:null
  };

//console.log(request);
//console.log(dataTemplate);





  //console.log(arr);
  request.resource["values"]=dataTemplateArrays;
  //console.log(request.resource);


}

function getLogsHTML(link,callback)
{
  console.log("getlogshtmlfunction");
  rp(link)
  .then(function(html){
    //console.log(html);
    //console.log(`\n\n\n\n\nHTML parsed: \n\n\n ${html}`);
    //console.log(html);
    callback(html);



    //console.log(htmlData.firstChild.structure);
  })
  .catch(function(err){
    //handle error
    console.log(err);
  });



}

function selectElementsFromDom(data)
{

    console.log("select elements from dom");
    //console.log(data);
    let $ = cheerio.load(data);
    //console.log($);


    logName = $('#log-name').text();
    logMap = $('#log-map').text();
    logLength = $('#log-length').text();
    date = $('log-date').text();
    blueScore = $('.pull-right').first().text();
    redScore = $('.pull-left').eq(1).text();

    players = $('[id^="player_"]');
    names = $('td.log-player-name > div > a')[0].children[0].data;

    for(i=0;i<players.length;i++)
    {
      //console.log(`${i} + index and data: ${players[i]}`);


      dataTemplate.push({
        "id":players[i].attribs.id,
        "teamcolor":players[i].children[1].children[0].data,
        "playername":$('td.log-player-name > div > a')[i].children[0].data,
        "class":$('td.log-classes.classes > i')[i].attribs["data-title"],
        "kills":$('td:nth-child(4)')[i].children[0].data,
        "assists":$('td:nth-child(5)')[i].children[0].data,
        "deaths":$('td:nth-child(6)')[i].children[0].data,
        "damage":$('td:nth-child(7)')[i].children[0].data,
        "damageaminute":$('td:nth-child(8)')[i].children[0].data,
        "killsassistperdeath":$('td:nth-child(9)')[i].children[0].data,
        "killsperdeath":$('td:nth-child(10)')[i].children[0].data,
        "damagetaken":$('td:nth-child(11)')[i].children[0].data,
        "damagetakenaminute":$('td:nth-child(12)')[i].children[0].data,
        "healthpacks":$('td:nth-child(13)')[i].children[0].data,
        "backstabs":$('td:nth-child(14)')[i].children[0].data,
        "headshots":$('td:nth-child(15)')[i].children[0].data,
        "airshots":$('td:nth-child(16)')[i].children[0].data,
        "capturepointcaptures":$('td:nth-child(17)')[i].children[0].data,
        "teamname":teamname,
        "weeknumber":week
      });
      //console.log(dataTemplate);

      dataTemplateArrays.push([
      players[i].attribs.id,
      players[i].children[1].children[0].data,
      $('td.log-player-name > div > a')[i].children[0].data,
      $('td.log-classes.classes > i')[i].attribs["data-title"],
      $('td:nth-child(4)')[i].children[0].data,
      $('td:nth-child(5)')[i].children[0].data,
      $('td:nth-child(6)')[i].children[0].data,
      $('td:nth-child(7)')[i].children[0].data,
      $('td:nth-child(8)')[i].children[0].data,
      $('td:nth-child(9)')[i].children[0].data,
      $('td:nth-child(10)')[i].children[0].data,
      $('td:nth-child(11)')[i].children[0].data,
      $('td:nth-child(12)')[i].children[0].data,
      $('td:nth-child(13)')[i].children[0].data,
      $('td:nth-child(14)')[i].children[0].data,
      $('td:nth-child(15)')[i].children[0].data,
      $('td:nth-child(16)')[i].children[0].data,
      $('td:nth-child(17)')[i].children[0].data,
      teamname,
      week
    ]);





}

  //console.log(players[0]);
  //console.log(dataTemplate[i].playername);
  //console.log(players[0]);
  console.log(dataTemplateArrays);
//  res.send(players);
}


app.get('/',function(req,res)
{
   res.sendFile('index.html', {root: __dirname })
});

//app.post('/:teamName/:weekNumber/:url',function(req,res)
app.post('/formSubmit',function(req,res)
{
  console.log("form submit");
  //console.log(req.body);


  url = req.body.logspage;
  teamname = req.body.teamname;
  week = req.body.week;
  console.log(req.body);

    getLogsHTML(url,function(htmlData)
    {
      //console.log(html);
      selectElementsFromDom(htmlData);
      createArrays();



      if(request==null)
      {
        console.log("working");
      }
      else if(request!=null)
      {
        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) =>
        {
          if (err) return console.log('Error loading client secret file:', err);

          // Authorize a client with credentials, then call the Google Sheets API.
        authorize(JSON.parse(content), appendToSheet);
        });



      }




    });


















});


app.listen(port,()=>console.log(`app listening on ${port}`));
