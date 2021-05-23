# Load Sample Data in MongoDb

1. `npm install`
2. Open `populate-db.js`
3. Populate your own `MONGODB_CONNECTION_URL` and `dbName`
4. Save the file
5. `npm start`

## Notes

Notes while learning MongoDb from zero

```
- Organization
	- Project
		- Clusters

### connection string without password
mongo "mongodb+srv://sandbox.hq1xl.mongodb.net/myFirstDatabase" --username m001-student

### connection string with password and default database
mongo "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/admin"
// if database (=admin) not specified, then default db= test

*****
mongo "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.hq1xl.mongodb.net/admin"
*****


### EXPORT
BSON
mongodump --uri "mongodb+srv://<your username>:<your password>@<your cluster>.mongodb.net/sample_supplies"
JSON
mongoexport --uri="mongodb+srv://<your username>:<your password>@<your cluster>.mongodb.net/sample_supplies" --collection=sales --out=sales.json

### IMPORT
BSON
mongorestore --uri "mongodb+srv://<your username>:<your password>@<your cluster>.mongodb.net/sample_supplies"  --drop dump
JSON
mongoimport --uri="mongodb+srv://<your username>:<your password>@<your cluster>.mongodb.net/sample_supplies" --drop sales.json (if "--collection" is not specified, it will take the name of the json file)

// "--drop" prevents duplicates


### display databases
show dbs

### select database
use {{ database_name }}

### display collections
show collections

### query
db.< collection_name >.find( {"state":"NY" } )

// may display only 1-20 results

### display the next page of results
it
// iterates through a cursor

### projection / specify fields to be displayed

db.< collection_name >.find( {"state":"NY"}, { "field_1": 1, "field_2": 1 } )
// will only display "field_1" and "field_2" plus the _id

db.< collection_name >.find( {"state":"NY"}, { "field_1": 0, "field_2": 0 } )
// will display all fields except "field_1" and "field_2"

// can only mix 1 and 0 if _id = 0

### count the results
db.< collection_name >.find().count()


### make the result nice
db.< collection_name >.find().pretty()


### get 1 sample document
db.< collection_name >.findOne()

### insert new document
db.< collection_name >.insert()
@params - array or object
@params - {"ordered":false} // this will insert multiple documents in any order, this way it handles and catch more errors for all duplicate documents

### import using a JSON file (for example sales.json)
mongoimport --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/< database_name >" sales.json


### updating multiple documents (increment)
db.< collection_name >.updateMany({ "city": "HUDSON" }, { "$inc": { "pop": 10 } })
@params - document to filter or find
@params - { "< update_operator >": < field to be updated > }
// Update all documents in the zips collection where the city field is equal to "HUDSON" by adding 10 to the current value of the "pop" field.
// (MQL) update operators: $inc, $set, $push
// $push -- add an element to an array field
// "$push": { "scores": {} } --- scores is an array

# {"upsert": true | false } // for conditional updates,,, ! BE MINDFUL
// By default upsert is set to false.
// When upsert is set to true and the query predicate returns an empty cursor, the update operation creates a new document using the directive from the query predicate and the update predicate.
// When upsert is set to false and the query predicate returns an empty cursor then there will be no updated documents as a result of this operation.

# updating single document
db.< collection_name >.updateOne() // same function with updateMany() but will only update the first match (if multiple match found)



# delete documents
db.< collection_name >.deleteMany()
db.< collection_name >.deleteOne()
db.< collection_name >.drop() // drops the collection!
// IMPORTANT: removing all collections in a database also removes the database





## MORE EXAMPLES OF MQL OPERATORS

== Find all documents where the tripduration was less than or equal to 70 seconds and the usertype was not Subscriber:

db.trips.find({ "tripduration": { "$lte" : 70 },
                "usertype": { "$ne": "Subscriber" } }).pretty()


== Find all documents where the tripduration was less than or equal to 70 seconds and the usertype was Customer using a redundant equality operator:

db.trips.find({ "tripduration": { "$lte" : 70 },
                "usertype": { "$eq": "Customer" }}).pretty()
== Find all documents where the tripduration was less than or equal to 70 seconds and the usertype was Customer using the implicit equality operator:

db.trips.find({ "tripduration": { "$lte" : 70 },
                "usertype": "Customer" }).pretty()




### LOGIC OPERATORS
$and (default)
$or
$nor

$not

db.grades.find({"student_id": {
	"$gt": 25,
	"$lt": 100
}})


### Expressive Query
$expr
// allows the use of aggregation expressions within the query language
// { $expr: { <expression> } }
// compares fields within the same documents


"$"
- denotes the user of an operator
- addresses the field value (looking at the value rather than the field name)

== Find all documents where the trip started and ended at the same station:

db.trips.find({ "$expr": { "$eq": [ "$end station id", "$start station id"] }
              }).count()


== Find all documents where the trip lasted longer than 1200 seconds, and started and ended at the same station:

db.trips.find({ "$expr": { "$and": [ { "$gt": [ "$tripduration", 1200 ]},
                         { "$eq": [ "$end station id", "$start station id" ]}
                       ]}}).count()




==  the following statements will find all the companies that have more employees than the year in which they were founded

db.companies.find(
  { "$expr": { "$gt": [ "$number_of_employees", "$founded_year" ] }}).count()

// We have to use the $expr operator to compare the two field values within each document. Using the $expr operator is the reason why we have to use the aggregation syntax for the comparison operator.


db.companies.find(
  { "$expr": { "$lt": [ "$founded_year", "$number_of_employees" ]}}).count()

// When we swap the compared fields and use the $lt less than operator instead of the $gt greater than operator, the result should still be correct.



MQL Syntax:
{ <field>: { <operator>: <value> } }

Aggregation Syntax:
{ <operator>: { <field>, <value> } }




### searching in array

db.< collection_name >.find({"countries":"usa"})
// this will work as long as there is "usa" in the array "countries"

// "countries":["usa"]
// this will work IF AND ONLY IF the countries[] contains exactly one item which is "usa"
// order does matter!!! that's the whole point of an ARRAY!

db.< collection_name >.find({"countries":{"$all":["usa"]}})
// this will return all documents that have at least these elements (even not in order)

$size: 20 == returns document with array length max of 20

db.< collection_name >.find({"scores":{"$elemMatch":{"score":{"$gt":85}}}})
// scores is an array with object as items
// use $elemMatch to match the field inside each object within the array

### sub-documents
// use dot notation for nested objects (or sub-documents) to access the fields/values
e.g.
field_1.other_field

field_1 : {
	other_field: value
}

// can also use on array in this case at index 0
--> field.0.other_field



### group and sum (aggregation -- reshapes data to be output without modifying the original data)
--- syntax
db.<collection>.aggregate([{
	"$group": {
		"_id": "$category",
		"total": { "$sum" : "$price" }
	 }
}])



--- e.g. data
{
	"category": "fish"
	"price: 5
},
{
	"category": "meat"
	"price: 25
},
{
	"category": "fish"
	"price: 7
},

--- output data
{
	"_id": "fish",
	price: 12
},
{
	"_id": "meat",
	price: 25
},

--- another syntax {"$group":{"_id":"category","count":{"$sum":1}}}
--- outputs data:
{"_id":"fish", "count": 2}
{"_id":"meat", "count": 1}



### .sort() and .limit() // regardless of order of syntax
db.<collection>.find().sort({"field_1":1}).limit(1)
// sort results according to "field_1" in increasing order and limit results to 1

db.<collection>.find().sort({"field_1":-1}).limit(1)
// sort results according to "field_1" in decreasing order and limit results to 1


### performance
learn .createIndex()
```
