'use strict';

const MONGODB_CONNECTION_URL = '<your_connection_string>';

const dbName = '<your_db_name>';

Object.defineProperty(exports, '__esModule', { value: true });

const db_data_1 = require('./db-data');
const util = require('util');
// const password = require('password-hash-and-salt');
const argon2 = require('argon2');

console.log('Populating the MongoDB database with some sample data ...');

const MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

const client = new MongoClient(MONGODB_CONNECTION_URL);

client.connect(async (err, client) => {
    try {
        if (err) {
            console.log(
                'Error connecting to database, please check the username and password, exiting.',
            );
            process.exit();
        }

        console.log('Connected correctly to server');

        const db = client.db(dbName);
        const courses = db_data_1.findAllCourses();

        for (let i = 0; i < courses.length; i++) {
            const course = courses[i];
            const newCourse = Object.assign({}, course);
            delete newCourse.id;

            console.log('Inserting course ', newCourse);

            const result = await db.collection('courses').insertOne(newCourse);
            const courseId = result.insertedId;

            console.log('new course id', courseId);

            const lessons = db_data_1.findLessonsForCourse(course.id);

            for (let j = 0; j < lessons.length; j++) {
                const lesson = lessons[j];
                const newLesson = Object.assign({}, lesson);
                delete newLesson.id;
                delete newLesson.courseId;

                newLesson.course = new ObjectId(courseId);

                console.log('Inserting lesson', newLesson);

                await db.collection('lessons').insertOne(newLesson);
            }
        }

        const users = db_data_1.findAllUsers();

        console.log('Inserting users ' + users.length);

        for (let j = 0; j < users.length; j++) {
            const user = users[j];
            const newUser = Object.assign({}, user);
            delete newUser.id;

            // npm i password-hash-and-salt
            // const hashPassword = util.promisify(
            //     password(newUser.password).hash,
            // );
            // newUser.passwordHash = await hashPassword();

            try {
                newUser.passwordHash = await argon2.hash(newUser.password);
            } catch (err) {
                console.log(err);
            }

            delete newUser.password;

            console.log('Inserting user', newUser);

            await db.collection('users').insertOne(newUser);
        }

        console.log('Finished uploading data, creating indexes.');

        await db
            .collection('courses')
            .createIndex({ url: 1 }, { unique: true });

        console.log('Finished creating indexes, exiting.');

        client.close();
        process.exit();
    } catch (error) {
        console.log('Error caught, exiting: ', error);
        client.close();
        process.exit();
    }
});
console.log('updloading data to MongoDB...');
process.stdin.resume();
