5 Things To Write High Quality JavaScript Code

If someone else looks at your code the first thing they will notice is if the code is readable. Without a doubt the most important thing
that makes your code readable is Coding Style.

When is the code a high quality one? When it is
- easy to read
- easy to follow logic
- easy to maintain
- easy to expand

It should be maintaninable.

I am not talking about testable, error resistabnce, etc.

1. The code should be readable. The code itself, not comments, should clearly state the intent. To make code readable, it is
very important to adopt a good coding style and follow it consistently.

2. Give short, consize names to methods and properties. Naming is hard.
- think of context where variable or property is defined?
- name important variables meaningfully
- do not use redundant names
	scope.scopeType -> scope.tyle
	getElementById -> $('#id')

3. Keep logic clean.
- avoid spagetty code
- avoid too much copy/pasta
- avoid call back hell (use promises)
- I prefer "for (var i = 0; i < array.length; i++)"
- traceable. Start with index.html file and see if you can follow the logic without jumping from file to file.

4. Refactor often. This is something many people ignore. You might think that renaming is next to impossible to do in your code because it
might be used in so many places. However, majority of text editors have a feature that allows you to replace a string in all of the files
of your project at once. Thus, if you have something that is pretty unique, it will not be difficult to change its name.
- remove unused blocks (not just comment)
- remove unused files

5. Follow established design patterns. 
- two kinds - common an uncommon. Common design patters are

Elegance is like beauty - "Code is poetry"
jsHint has code quality parameter

grid.remove.apply(grid.get())