## Deploy LocalJobs Application on OpenShift##

1. Create a new JBoss EAP MongoDB application
```
rhc app create localjobs jbosseap mongodb-2.2 
```

2. Pull the source code from github
```
git rm -rf src/ pom.xml
git commit -am "deleted default files"
git remote add upstream -m master https://github.com/shekhargulati/localjobshtml5.git
git pull -s recursive -X theirs upstream master
```

3. Import data into MongoDB. Get the ssh url
```
rhc show-app
```
Scp the jobs-data.json to OpenShift application gear.
```
scp jobs-data.json <ssh_url>:app-root/data
```
SSH into application gear
```
rhc ssh
```
Run mongoimport command.
```
cd app-root/data
mongoimport -d localjobs -c jobs --file jobs-data.json -u $OPENSHIFT_MONGODB_DB_USERNAME -p $OPENSHIFT_MONGODB_DB_PASSWORD -h $OPENSHIFT_MONGODB_DB_HOST -port $OPENSHIFT_MONGODB_DB_PORT
```
Run the mongo client
```
mongo
> use localjobs
switched to db localjobs
> 
> db.jobs.ensureIndex({"location":"2d"})
```
4. Push the code to OpenShift application gear
