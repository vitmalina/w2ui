require './app/models/user'
require 'faker'

(1..1000).each do |i|
  User.create!(
    userid: i,
    fname: Faker::Name.first_name,
    lname: Faker::Name.last_name,
    email: Faker::Internet.email,
    login: Faker::Name.first_name,
    password: 'password'
  )
end
