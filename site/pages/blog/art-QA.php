# Quality Engineering in Front-End applications

A half of year ago, my manager came up to me and said: "I have some news... We do not have QA anymore... From now on, you are completely responsible for the quality of your own code." At this very moment time seemed to have stopped and I vividly imagined a "doom's day" coinciding with our next release date. It was inevitable... and there was no time to prepare for it. I thought of all doom's day movies were machines were taking over the world, the ruins and chaos that followed, the savage-looking people running around trying to find rest, avoiding somme mean, crazy AI that wanted to dominate their world and control their minds. But I made my best effort to snap back to reality.

Then my manager said a few other things that started me thinking. He said that it is a trend in the industry to move away from QA towards QE (Quality Engineering) and devleopers all over the spectrum realise that in order to be more effective, you have to design application with quality automation in mind. For a bit we discussed various approaches used by big companies to insure quality of the application. Statistical methods, for example, used by Facebook to see if usage of some part of the application has dropped indicating that users are struggle with it after an update. We also discussed the most fundamental problem of QA - how do you ensure quality of the application and realised that this question does not have a simple answer.

After leaving office that day, one phrase was echoing in my mind - Quality Engineeering. My manager suggested to start with TDD to see if this can be used as part of UI developement cycle.

# TDD/BDD and the like

TDD starts with a great premise - write a test first then write code to satisfy it. It is simple and attractive. There is a host of use cases where it is actually an excellent approach, but in case of UI, and front-end in general, it is hard to implement. I have discovered that there are different schools of TDD thought - classical Detroit (aka Chicago school), mockist London, as well as various flavors of TDD such as BDD and ATDD. TDD is a mature approach, but It felt like many people were struggling to use the idea effectively and the community would come up with some "ad-hoc" modifications to make it suitable again.

I, too, struggle to apply TDD approach in UI developement. So, I am suppose to write a test that checks if div is present on the page, then create a code to insert that div to satisty the test. Then, write a test to see if this div has a certain class, and then write code to add that class... etc. What exactly am I testing? Am I testing that browser can insert a div and apply a class without breaking up? And it seemsed too granual. I will be spending 99% of my coding time writing tests that test how browser inserts nodes and will have no time to work on my application.

It is not my intention in this article to argue TDD's pros and cons, as there is a host of articles about it on the web already. I leave you with a short quote from wikipedia:

> Test-driven development is difficult to use in situations where full functional tests are required to determine success or failure. Examples of these are user interfaces, programs that work with databases, and some that depend on specific network configurations.

One positive thing came out of this research. I have discoverd that there are different types of tests:

- unit tests
- functional tests
- integration tests
- end-to-end tests
- acceptance tests
- manual tests
- smoke tests
- regression tests

And I have come to the conclution that in order to test UI effectively I need to write end-to-end tests and emulate user interaction with the page as close as possible. After all, front-end is for users to interact with the application, so I need to think as a user. Users see application as a whole,

# Existing tools and approaches

# Development cycle

If I want my test automation to be part of

1. It needs to be a JS based approach


# Things that QA used to do that we still need

Developers were responsible for unit tests

We realized we still need QA for
- second pair of eyes (always manual)
- spec validation

Not responsible for automation


For far too long, QA and developers were in their own silos and with time this two worlds have driffed appart. The code that developers produced became harder and harder to test. It is difficult to write automation the in many cases

but there was a big dilema, from now own in additoion to creating beutiful and userfriendly UI, I am responsible for writing automation. So, my work just doubled but the deadlines remained as tight as they were.

- easily testable

And for the next few month of transition the world would b

Things I love about being a JS developer

1. I can do small change, save, refresh, observe/play with results in less then a second.

2. I can put a debuger and evaluate JS scope, DOM state, CSS right there in the browser.

3. I can tune my CSS rule right in the bworser, make it look/feel exactly as I want and then copy/paste it into my code.

What is th biggest problem of QA - Regression.

I want browser based tool, not the one that runs in node