# Naming
Names should be short, maximum 3 words, and no longer than 25 symbols
Names should clear define the purpose. 
Method names should start with action. For example: **create**Message, **handle**Click, **set**Account

## case
PascalCase – Class names, constructor functions, modules
lower-kebab-case – components in templates, URLs
UPPER_SNAKE_CASE – constants
camelCase – other cases

# Indention 
Indent with 2 spaces, no tabs.

# Quotes
Object properties, if possible without quotes.
HTML properties/attributes, JSON - double quotes (") 
Multiline strings - grave accent (backtick) (`)
Use single quotes (') in all other cases.

# Line lengths
You should limit your lines to 100 chars.
You can setup limit in linter: 
ESLint:
`'max-len': ['error', {'code': 100}]`
TSLint:
`"max-line-length": [true, 100]`

or in IDE 

WebStorm:
* File > Settings > Editor > Code Style > Hard wrap at 100
* File > Settings > Editor > Code Style > Visual guides 80
* File > Settings > Editor > Code Style > JavaScript > Tabs and Indents > Use tab character
* File > Settings > Editor > Code Style > JavaScript > Tabs and Indents > Smart tabs
* File > Settings > Editor > General > Soft Wraps > Soft-wrap files *
* File > Settings > Editor > General > Appearance > Show whitespaces
* View > Active Editor > Show whitespaces

