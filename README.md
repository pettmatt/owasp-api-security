## API endpoints

**POST /api/auth/register**

```json
{ email: "test@example.com", "password": "somepass12" }
```

**POST /api/auth/login**

```json
{ email: "test@example.com", "password": "somepass12" }
```

**POST /api/auth/refresh**

Requires: `refreshToken`

**POST /api/auth/logout**

Requires: `accessToken`

**GET /api/users/user**

Requires: `Authorization: Bearer <accessToken>`

**GET /api/users/:id**

Requires authenticated user with admin role.

**GET /health**

## Checking for vulnerabilities (OWASP 2023)

The main purpose of this repository is to test and explore how API security can be improved. For now I'm focusing on OWASP 2023 top 10 list and most known vulnerabilities, but I might explore other "benchmarks" and methods in the future. For now vulnerability testing methods can be viewed in `./tests` directory.

Source: https://owasp.org/API-Security/editions/2023/en/0x11-t10/

|Risk|Desciption|Done|Reason
|---|---|---|---|
|API1:2023 - Broken Object Level Authorization|APIs tend to expose endpoints that handle object identifiers, creating a wide attack surface of Object Level Access Control issues. Object level authorization checks should be considered in every function that accesses a data source using an ID from the user.|[x]|
|API2:2023 - Broken Authentication|Authentication mechanisms are often implemented incorrectly, allowing attackers to compromise authentication tokens or to exploit implementation flaws to assume other user's identities temporarily or permanently. Compromising a system's ability to identify the client/user, compromises API security overall.|[x]|
|API3:2023 - Broken Object Property Level Authorization|This category combines API3:2019 Excessive Data Exposure and API6:2019 - Mass Assignment, focusing on the root cause: the lack of or improper authorization validation at the object property level. This leads to information exposure or manipulation by unauthorized parties.|[ ]|Hard to replicate with this API. The API exposes only /users/:id route, which could be harmful, but because API verifies user's role and doesn't use the data from the request, user's data cannot be accessed by normal users. Other routes that have a payload use it only to verify the user, so there isn't really a target for this type of attack.|
|API4:2023 - Unrestricted Resource Consumption|Satisfying API requests requires resources such as network bandwidth, CPU, memory, and storage. Other resources such as emails/SMS/phone calls or biometrics validation are made available by service providers via API integrations, and paid for per request. Successful attacks can lead to Denial of Service or an increase of operational costs.|[ ]|Hard to replicate with this API. Could be replicated by uploading large files to the API, but we don't have that kind of logic. The attack's idea is to deny access to the service or exploit free service(s) making upkeeping more expensive, which is similar to normal DoS attacks, which the API handles through rate limiter. Overall the issue can be solved by adopting "fail fast and fail often" and "never trust the client" API design philosophies.|
|API5:2023 - Broken Function Level Authorization|Complex access control policies with different hierarchies, groups, and roles, and an unclear separation between administrative and regular functions, tend to lead to authorization flaws. By exploiting these issues, attackers can gain access to other users’ resources and/or administrative functions.|[ ]|Hard to replicate in this API. Just like in API issue 4, with proper API design philosophies and implementation this issue is hard to replicate. That said people make mistakes and this is a good issue to cover with a test.|
|API6:2023 - Unrestricted Access to Sensitive Business Flows|APIs vulnerable to this risk expose a business flow - such as buying a ticket, or posting a comment - without compensating for how the functionality could harm the business if used excessively in an automated manner. This doesn't necessarily come from implementation bugs.|[ ]|Hard to replicate in this API. In a sense close to DoS-attack, but instead of trying to crash the site the attacker's goal is often to exploit the system by using bots or scripts to publish comments, scalp the inventory, creating a scenario where a company has to put on a sale or exploit free credit systems. Trickier to patch out, but not impossible, the system could need another layer of verification that is harder to automate, making sure each user is unique with their own device or analyze traffic and block certain traffic that is known to be from a script-tool or block traffic from IPs that act like a non human entity.
|API7:2023 - Server Side Request Forgery|Server-Side Request Forgery (SSRF) flaws can occur when an API is fetching a remote resource without validating the user-supplied URI. This enables an attacker to coerce the application to send a crafted request to an unexpected destination, even when protected by a firewall or a VPN.|[ ]|More of a internal network exploit of a corporation than a pure software exploit (access point can be unsecure software). Exploitable if the server doesn't have robust user validation or don't validate payloads or url-parameters that are coming from the client. Disabling HTTP redirections simple and effective. Monitoring network is also one approach and using denying by default approach and logging attempted network flows on firewalls.
|API8:2023 - Security Misconfiguration|APIs and the systems supporting them typically contain complex configurations, meant to make the APIs more customizable. Software and DevOps engineers can miss these configurations, or don't follow security best practices when it comes to configuration, opening the door for different types of attacks.|[ ]|Misconfigurations on any part of the main software or the cloud can introduce vulnerability. This also includes unnecessary services, ports, pages, accounts or privileges being enabled. Having these enabled isn't itself an issue, but it gives the attacker more ground to exploit especially if the maintainers are not affair of these being still enabled.|
|API9:2023 - Improper Inventory Management|APIs tend to expose more endpoints than traditional web applications, making proper and updated documentation highly important. A proper inventory of hosts and deployed API versions also are important to mitigate issues such as deprecated API versions and exposed debug endpoints.|[ ]|
|API10:2023 - Unsafe Consumption of APIs|Developers tend to trust data received from third-party APIs more than user input, and so tend to adopt weaker security standards. In order to compromise APIs, attackers go after integrated third-party services instead of trying to compromise the target API directly.|[ ]|

Note 1: Come to mind it would probably be interesting "honey pot" idea to expose couple routes in a way that look exploitable, but they would provide dummy data, log every request and report compromised user accounts if the routes needed a valid authentication.

Note 2: Most if not all example exploits in owasp.org require that the payload is not validated, which would allow attacked to inject whatever values to the payload, creating a different outcome that was intended. For example role property is often used to injected "admin" value. That exploit would be easy to catch by not trusting the client. But for an example the most simple ones are the best (I'm just venting, because the fix is seemingly so simple).
