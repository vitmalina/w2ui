require 'rubygems'
require 'bundler'
Bundler.require
require 'active_record'
require 'mysql2'
require 'sinatra'
require 'sinatra/reloader' if development?

require './app/models/user'

require './app'

run App
