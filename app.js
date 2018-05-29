var express = require('express');
var path = require('path');
var app = express();
var request = require('request');
var cheerio = require('cheerio')
var fs = require('fs')
var mongoose = require('mongoose');
var async = require('async');
var mysql = require('mysql')

var port = 3000;


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
mongoose.connect('mongodb://localhost/WebScraping');
var db = mongoose.connection;
var web_scraping_schema = new mongoose.Schema({
    type: String,
    NDB: String,
    description: String,
    manufacturer: String
});
var web_scraping_data = mongoose.model("webScrapeData", web_scraping_schema);



var items = 0;
var url = "https://ndb.nal.usda.gov/ndb/search/list?format=&count=&max=25&sort=fd_s&fgcd=&manu=&lfacet=&qlookup=&ds=&qt=&qp=&qa=&qn=&q=&ing=&offset=" + items + "&order=asc"
var paginationCount = 10
var itemsCount = paginationCount * 25;

total_page()

function total_page () {
	   request(url, function(err, resp, html) {
				if (err) {
					console.log(err)
				}
				var $ = cheerio.load(html)
				totalNum = $('.paginateButtons').children().eq(-2).text()
				console.log("There are " + totalNum + " pages")
				
	   })
	   setTimeout(scrape, 1000)
}



function scrape() {
	async.whilst(
		  function() {
		  
		  	 return items < itemsCount
		  },
		  function(callback) {
		  	
			

			request(url, function(err, resp, html) {
				if (err) {
					console.log(err)
				}
				var $ = cheerio.load(html)
				// var type = []
				// var NDB = []
				// var description = []
			 //  var manufacturer = []
				var allItems = $('.table.table-bordered.table-striped.table-fixed-header.table-hover > tbody').children();
				//var pageCount = $('.paginateButtons  > a:nth-last-child(1)').text();
			    //pageCount = $('.paginateButtons').children().eq(-2).text()
			  
				
				allItems.each(function(index) {

					var type = allItems.eq(index).children().eq(0).text().trim();
					
					var NDB = allItems.eq(index).children().eq(1).text().trim();
					
					var description = allItems.eq(index).children().eq(2).text().trim()
					var manufacturer = allItems.eq(index).children().eq(3).text().trim()
					var newScrapeData = {type: type, NDB: NDB, description: description, manufacturer: manufacturer};
					web_scraping_data.create(newScrapeData, function(err, newlyCreated) {
						if (err) {
							console.log("Error")
						} 
					})

				})

			 
			     items = items + 25
			    url = "https://ndb.nal.usda.gov/ndb/search/list?format=&count=&max=25&sort=fd_s&fgcd=&manu=&lfacet=&qlookup=&ds=&qt=&qp=&qa=&qn=&q=&ing=&offset=" + items + "&order=asc"
			    //console.log(pageCount)
			    console.log("Already read " + items + " items")
			    setTimeout(callback, 1000)
			    console.log("Wait 1 second")

			})
		 }, 
		 function callback(err) {
		 	if (err) {
		 		console.log(err)
		 		return
		 	}
		 	console.log('complete')
		 	
		 }

	);
}

app.listen(port)
console.log('server running on ' + port)