require 'sinatra/base'
require 'sinatra/reloader'
require 'json'

class App < Sinatra::Base
  configure do
    set :public_folder, Proc.new { File.join(root, 'assets') }
    set :views, Proc.new { File.join(root, 'app', 'views') }
  end

  configure :development do
    register Sinatra::Reloader
    also_reload './app/models/user.rb'
  end

  get '/' do
    erb :index
  end

  get '/users' do
    content_type :json

    users = User.search_with(params[:search] || {}, search_logic: params[:searchLogic])
    users.to_w2ui_json(limit: params[:limit], offset: params[:offset])
  end

  get '/user/:id' do
    content_type :json

    user = User.find(params[:id])
    user.as_json.merge(recid: user.userid).to_json
  end

  post '/user' do
    content_type :json

    user = User.new(params[:record])
    response = if user.save(params[:record])
                 { status: 'success' }
               else
                 { status: 'failed', message: 'Something...' }
               end
    response.to_json
  end

  put '/user/:id' do
    content_type :json

    user = User.find(params[:id])
    response = if user.update_attributes(params[:record])
                 { status: 'success' }
               else
                 { status: 'failed', message: 'Something...' }
               end
    response.to_json
  end

  delete '/users/:ids' do
    content_type :json

    users = User.where(userid: params[:ids].split(','))
    response = if users.destroy_all
                 { status: 'success' }
               else
                 { status: 'failed', message: 'Something...' }
               end
    response.to_json
  end
end
