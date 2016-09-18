# JSChecker

## Introduction

JSChecker is a tool to check for various javascript related security requirements. This tool is currently under development and more documentation will be updated once it is completed.

## Requirement

1. [PhantomJS 2](http://phantomjs.org/download.html)
2. [Redis](http://redis.io/download)
3. [Mongo DB](https://www.mongodb.com/download-center)
4. [NodeJS 4](https://nodejs.org/en/download/)
5. [openssl](https://www.openssl.org/source/)

## Config

1. Port (Default : 8080, 8082) : This application uses two ports mentioned. You can change the ports by editing the *config.json* inside the config directory. Make sure the ports are available before you run the application.

## Functionalities

### Sub Resource Integrity Check
As mentioned in the mozilla website, Subresource Integrity (SRI) is a security feature that enables browsers to verify that files they fetch (for example, from a CDN) are delivered without unexpected manipulation. It works by allowing you to provide a cryptographic hash that a fetched file must match.

#### How It helps
Using Content Delivery Networks (CDNs) to host files such as scripts and stylesheets that are shared among multiple sites can improve site performance and conserve bandwidth. However, using CDNs also comes with a risk, in that if an attacker gains control of a CDN, the attacker can inject arbitrary malicious content into files on the CDN (or replace the files completely) and thus can also potentially attack all sites that fetch files from that CDN.

The Subresource Integrity feature enables you to mitigate the risk of attacks such as this, by ensuring that the files your Web application or Web document fetches (from a CDN or anywhere) have been delivered without a third-party having injected any additional content into those files — and without any other changes of any kind at all having been made to those files.

#### Usage
You use the Subresource Integrity feature by specifying a base64-encoded cryptographic hash of a resource (file) you’re telling the browser to fetch, in the value of the integrity attribute of any <script> or <link> element.

An integrity value begins with at least one string, with each string including a prefix indicating a particular hash algorithm (currently the allowed prefixes are sha256, sha384, and sha512), followed by a dash, and ending with the actual base64-encoded hash.

#### Example
<script src="https://example.com/example-framework.js" integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" crossorigin="anonymous"></script>
