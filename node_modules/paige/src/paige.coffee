# Require our external dependencies, including **Showdown.js**
# (the JavaScript implementation of Markdown).
_ =               require "underscore"
fs =              require 'fs'
path =            require 'path'
showdown =        require('./../vendor/showdown').Showdown
{spawn, exec} =   require 'child_process'
events      =     require('events')
promise =         new events.EventEmitter

# Ensure that the destination directory exists.
ensure_directory = (dir, callback) ->
  exec "mkdir -p #{dir}", -> callback()


# Micro-templating, originally by John Resig, borrowed by way of
# [Underscore.js](http://documentcloud.github.com/underscore/).
template = (str) ->
  new Function 'obj',
    'var p=[],print=function(){p.push.apply(p,arguments);};' +
    'with(obj){p.push(\'' +
    str.replace(/[\r\t\n]/g, " ")
       .replace(/'(?=[^<]*%>)/g,"\t")
       .split("'").join("\\'")
       .split("\t").join("'")
       .replace(/<%=(.+?)%>/g, "',$1,'")
       .split('<%').join("');")
       .split('%>').join("p.push('") +
       "');}return p.join('');"


# Kind of hacky, but I can't figure out another way of doing this cleanly.
# Will list all the files that will be used as your source file for passing onto Docco.
get_subfiles = (callback) ->
  results = []
  count = 0
  find_files = (file, total) ->
    f_path = file.substr(0,file.lastIndexOf('/')+1)
    f_file = file.substr(file.lastIndexOf('/')+1)
    exec "find ./#{f_path} -name '#{f_file}' -print", (error, stdout, stderr) ->
      count++
      results = _.uniq(_.union(results, stdout.trim().split("\n")))
      if count >= total
        callback results.sort() if callback

  if _.isArray(configuration.docco_files)
    _.each configuration.docco_files, (file) ->
      find_files(file,configuration.docco_files.length)
  else if _.isString(configuration.docco_files)
    find_files(configuration.docco_files,1)


# Pass the list of files as process arguments, which is the only way I can interface with Docco at this point.
process_docco_files = ->
  get_subfiles (result) ->
    process.ARGV = process.argv = result
    require 'docco'


# Creates html wrapper for all the Docco pages.
# The point here is that I can now keep a navigation bar at the top without having to
# mess with any of the Docco internals at all.
process_docco_wrappers = ->
  get_subfiles (result) ->
    result = clean_path_names result
    result = clean_file_extension result
    _.each result, (file) ->
      html = wrapper_template {
        title:            configuration.title,
        header:           configuration.header,
        subheader:        configuration.subheader,
        file:             file
      }
      fs.writeFile "docs/doc_#{file}.html", html


# Process the configuration file
process_config = (config={}) ->
  _.map config, (value, key, list) ->
    configuration[key] = value if config[key]?


# Remove trailing path names from each file from a list
clean_path_names = (names) ->
  clean_names = []
  _.each names, (name) ->
    clean_names.push name.substr(name.lastIndexOf('/')+1) || name
  return clean_names


# Remove file extensions from each file from a list
clean_file_extension = (names) ->
  clean_names = []
  _.each names, (name) ->
    clean_names.push name.substr(0,name.lastIndexOf('.')).substr(name.lastIndexOf('/')+1) || name
  return clean_names


# Build the main html file by reading the source Markdown file, and if necessary
# collecting all the filenames of our source. We will then use these names to construct the
# index that's shown at the top of the page.

# We pass the source Markdown file to Showdown, get the result, then pipe it into
# our templating function described above.
process_html_file = ->
  source = configuration.content_file
  get_subfiles (result) ->
    subfiles_names = clean_file_extension(result) if configuration.include_index
    subfiles = clean_path_names(result) if configuration.include_index
    fs.readFile source, "utf-8", (error, code) ->
      if error
        console.log "\nThere was a problem reading your the content file: #{source}"
        throw error
      else
        content_html = showdown.makeHtml code
        html = mdown_template {
          content_html:     content_html,
          title:            configuration.title,
          header:           configuration.header,
          subheader:        configuration.subheader,
          include_index:    configuration.include_index,
          subfiles:         subfiles,
          subfiles_names:   subfiles_names
        }
        console.log "paige: #{source} -> docs/index.html"
        fs.writeFile "docs/index.html", html


# Reads the background image.
paige_background    = ->
  fs.readFileSync(__dirname + "/../resources/#{configuration.background}.png")


# Process the Docco files and wrappers if needed.
check_for_docco = ->
  if configuration.docco_files?
    process_docco_files()
    process_docco_wrappers()

# Read our configuration file.
read_config = (callback) ->
  filename = "paige.config"
  filename = process.ARGV[2] if process.ARGV[2]?
  fs.readFile filename, "utf-8", (error, data) ->
    if error
      console.log "\nCould not find a configuration file. (default: ./paige.config)"
      console.log "Create and specify a configuration file. Example:\n\n"
      console.log config_template + "\n"
    else
      config = JSON.parse(data)
      callback(config) if callback

# Some necessary files
mdown_template =    template fs.readFileSync(__dirname + '/../resources/paige.jst').toString()
wrapper_template =  template fs.readFileSync(__dirname + '/../resources/doc.jst').toString()
config_template =   fs.readFileSync(__dirname + '/../resources/paige.config').toString()

# And our current, and base configuration
configuration = {}
base_config = {
  "title" :             "Untitled",
  "content_file" :      "README.mdown",
  "include_index" :     false,
  "docco_files" :       null,
  "header" :            "Untitled",
  "subheader" :         "Untitled",
  "background" :        "bright_squares"
}

# Run the script
ensure_directory 'docs', ->
  read_config (config) ->
    process_config(config)
    fs.writeFile 'docs/bg.png', paige_background()
    process_html_file()
    check_for_docco()