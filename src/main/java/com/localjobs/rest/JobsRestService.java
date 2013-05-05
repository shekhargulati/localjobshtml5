package com.localjobs.rest;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.inject.Inject;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import com.localjobs.mongo.Job;
import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.CommandResult;
import com.mongodb.DB;

@Path("/jobs")
public class JobsRestService {

	@Inject
	private DB db;

	@GET
	@Path("/{skills}")
	@Produces(MediaType.APPLICATION_JSON)
	public List<Job> allJobsNearToLocationWithSkill(
			@PathParam("skills") String skills,
			@QueryParam("longitude") double longitude,
			@QueryParam("latitude") double latitude) {
		
		String[] skillsArr = skills.split(",");
		BasicDBObject cmd = new BasicDBObject();
		cmd.put("geoNear", "jobs");
		double lnglat[] = { longitude, latitude };
		cmd.put("near", lnglat);
		cmd.put("num", 10);
		BasicDBObject skillsQuery = new BasicDBObject();
		skillsQuery.put("skills",
				new BasicDBObject("$in", Arrays.asList(skillsArr)));
		cmd.put("query", skillsQuery);
		cmd.put("distanceMultiplier", 111);

		System.out.println("Query -> " + cmd.toString());
		CommandResult commandResult = db.command(cmd);

		BasicDBList results = (BasicDBList)commandResult.get("results");
		List<Job> jobs = new ArrayList<Job>();
		for (Object obj : results) {
			Job job = new Job((BasicDBObject)obj);
			jobs.add(job);
		}
		System.out.println("Result : " + jobs);

		return jobs;
	}
}
