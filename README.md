# Yeoman generator providing utilities for IBM Java Generator

This yeoman generator provides utilities for interacting with the [IBM Java Generator](https://github.com/ibm-developer/generator-ibm-java).

## Pre-requisites

* [Node](https://nodejs.org/en/download/) version 6 or higher
* [Yeoman](http://yeoman.io/learning/index.html)

## Installing the generator

To install the generator:
1. `git clone git@github.com:ibm-developer/generator-ibm-java-utils.git`
1. `cd generator-utils`
1. `npm install`
1. `npm link` 

## Running the generator

Running the generator will produce a script file under `generated` in the current directory that can be used to invoke the [Java generator](https://github.com/ibm-developer/generator-ibm-java).

### Running with prompting

To run the generator providing options via prompts:

1. `yo ibm-java-utils`
1. Answer the prompts with the required options for generation
1. The generator will create a file called `generated/yojava.sh` to run the Java generator
1. The generator will create a file called `generated/data.json` which can be used for subsequent runs

### Running with a JSON object

The generator can be run using a JSON object such as:

```
{
	"createType": "blank/spring",
	"buildType": "gradle",
	"appName": "MyProject",
	"groupId": "projects",
	"artifactId": "MyProject",
	"platforms": [
		"cli",
		"bluemix",
		"kube"
	],
	"bluemix": "\"{\\\"backendPlatform\\\":\\\"SPRING\\\"}\""
}
```

Create a file called `data.json` with the above contents and run:

```
yo ibm-java-utils --data data.json 
```

The generator will create a file called `generated/yojava.sh` to run the Java generator.

# Further documentation

For more information on running the Java generators see the [docs](https://pages.github.ibm.com/arf/java-codegen-devguide/).



