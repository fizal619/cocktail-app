require "minitest/autorun"
require "yaml"

DRINKS      = YAML.load_file(File.join(__dir__, "../_data/drinks.yaml"))
ASSETS_DIR  = File.join(__dir__, "../assets")

class DrinksDataTest < Minitest::Test
  def test_drinks_is_a_non_empty_array
    assert_kind_of Array, DRINKS
    refute_empty DRINKS
  end

  def test_each_drink_has_required_fields
    DRINKS.each do |drink|
      %w[name shortname ingredients instruction].each do |field|
        assert drink[field] && !drink[field].to_s.empty?,
          "drink #{drink.inspect} is missing required field '#{field}'"
      end
    end
  end

  def test_shortnames_are_unique
    shortnames = DRINKS.map { |d| d["shortname"] }
    assert_equal shortnames.length, shortnames.uniq.length,
      "duplicate shortnames found: #{shortnames.select { |s| shortnames.count(s) > 1 }.uniq}"
  end

  def test_shortnames_contain_only_valid_characters
    DRINKS.each do |drink|
      assert_match(/\A[a-z0-9_]+\z/, drink["shortname"],
        "'#{drink["shortname"]}' must use only lowercase letters, numbers, and underscores")
    end
  end

  def test_each_drink_has_at_least_one_ingredient
    DRINKS.each do |drink|
      assert_kind_of Array, drink["ingredients"],
        "drink '#{drink["name"]}' — ingredients must be an array"
      refute_empty drink["ingredients"],
        "drink '#{drink["name"]}' has no ingredients"
    end
  end

  def test_each_drink_has_an_image
    DRINKS.each do |drink|
      path = File.join(ASSETS_DIR, "#{drink["shortname"]}.png")
      assert File.exist?(path),
        "missing image for '#{drink["name"]}': assets/#{drink["shortname"]}.png not found"
    end
  end
end
