class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users, primary_key: 'userid' do |t|
      t.string :fname, limit: 50
      t.string :lname, limit: 50
      t.string :email, limit: 75
      t.string :login, limit: 32, null: false
      t.string :password, limit: 32, null: false
    end
  end

  def self.down
    drop_table :users
  end
end
