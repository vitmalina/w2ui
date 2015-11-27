# == Schema Information
#
# Table name: users
#
#  userid   :integer          not null, primary key
#  fname    :string(50)
#  lname    :string(50)
#  email    :string(75)
#  login    :string(32)       not null
#  password :string(32)       not null
#

class User < ActiveRecord::Base
  self.primary_key = :userid

  SEARCHABLE_ATTRIBUTES = %w(fname lname email login).freeze

  attr_accessor :recid

  def self.search_with(w2ui_search_params, search_logic: 'AND')
    conditions = w2ui_search_params
      .map { |_, condition| condition }
      .select { |condition| SEARCHABLE_ATTRIBUTES.include?(condition[:field]) }
      .map { |condition| search_field_condition(condition) }

    if search_logic == 'OR'
      self.all.where(conditions.reduce(:or))
    else
      self.all.where(conditions.reduce(:and))
    end
  end

  def self.search_field_condition(params = {})
    fail 'Unsupported Field Types' unless params[:type] == 'text'

    case params[:operator]
    when 'is'
      arel_table[params[:field]].eq(params[:value])
    when 'contains'
      arel_table[params[:field]].matches("%#{params[:value]}%")
    when 'begins'
      arel_table[params[:field]].matches("#{params[:value]}%")
    when 'ends'
      arel_table[params[:field]].matches("%#{params[:value]}")
    end
  end

  def self.to_w2ui_json(limit: 100, offset: 0)
    total_count = all.count
    records = all
      .limit(limit)
      .offset(offset)
      .map { |record| record.as_json.merge(recid: record.userid) }
    {
      total: total_count,
      records: records
    }.to_json
  end
end
