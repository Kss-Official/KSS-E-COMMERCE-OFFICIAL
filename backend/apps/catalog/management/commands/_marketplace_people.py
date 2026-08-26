"""
Supporting people + commerce data for ``seed_marketplace``.

The reviewer pool doubles as the customer base: ``Review`` has a
``unique_together ('product', 'user')`` constraint, so a product can only carry
as many reviews as there are distinct accounts. These are ordinary CUSTOMER
accounts with unusable passwords - they exist so review counts, order history
and the Admin > Users tab all reflect a populated marketplace.
"""

# (first_name, last_name, city, state, pincode)
REVIEWERS = [
    ("Aarav", "Sharma", "Mumbai", "Maharashtra", "400001"),
    ("Diya", "Patel", "Ahmedabad", "Gujarat", "380001"),
    ("Vivaan", "Reddy", "Hyderabad", "Telangana", "500001"),
    ("Ananya", "Iyer", "Chennai", "Tamil Nadu", "600001"),
    ("Aditya", "Nair", "Kochi", "Kerala", "682001"),
    ("Ishita", "Banerjee", "Kolkata", "West Bengal", "700001"),
    ("Kabir", "Singh", "Chandigarh", "Punjab", "160001"),
    ("Meera", "Joshi", "Pune", "Maharashtra", "411001"),
    ("Rohan", "Gupta", "New Delhi", "Delhi", "110001"),
    ("Sanya", "Malhotra", "Gurugram", "Haryana", "122001"),
    ("Arjun", "Menon", "Bengaluru", "Karnataka", "560001"),
    ("Tanvi", "Deshmukh", "Nagpur", "Maharashtra", "440001"),
    ("Neel", "Chatterjee", "Howrah", "West Bengal", "711101"),
    ("Priya", "Rao", "Visakhapatnam", "Andhra Pradesh", "530001"),
    ("Yash", "Agarwal", "Jaipur", "Rajasthan", "302001"),
    ("Kavya", "Pillai", "Thiruvananthapuram", "Kerala", "695001"),
    ("Devansh", "Mehta", "Surat", "Gujarat", "395003"),
    ("Riya", "Kulkarni", "Nashik", "Maharashtra", "422001"),
    ("Aryan", "Bhatt", "Vadodara", "Gujarat", "390001"),
    ("Naina", "Kapoor", "Lucknow", "Uttar Pradesh", "226001"),
    ("Kunal", "Verma", "Bhopal", "Madhya Pradesh", "462001"),
    ("Sara", "Khan", "Bhubaneswar", "Odisha", "751001"),
    ("Advik", "Saxena", "Kanpur", "Uttar Pradesh", "208001"),
    ("Trisha", "Ghosh", "Siliguri", "West Bengal", "734001"),
]

# Realistic review copy, bucketed by star rating so the text matches the score.
REVIEW_COPY = {
    5: [
        ("Absolutely worth every rupee", "Delivery was quick and the packaging was sealed. Build quality is far better than I expected at this price. Using it daily for three weeks now with zero complaints."),
        ("Exceeded my expectations", "I compared this against two other brands before buying and I am glad I picked this one. Finish is premium and it performs exactly as advertised."),
        ("Best purchase this year", "Genuine product with proper invoice and warranty card. Works flawlessly. Would happily buy again from BuyZo."),
        ("Superb quality, highly recommend", "Ordered on a Sunday and it arrived Tuesday morning. No scratches, no missing accessories. Very satisfied with the whole experience."),
        ("Great value for money", "Does everything it promises. My family has been using it for a month and it still feels brand new."),
    ],
    4: [
        ("Very good, minor niggles", "Overall a solid buy and I would recommend it. Knocking off one star only because the manual is not very detailed."),
        ("Happy with it so far", "Performance is good and it looks great. Took a couple of days longer to arrive than the estimate, but no damage."),
        ("Good product, fair price", "Quality is what you would expect at this price point. Nothing to complain about apart from the plain packaging."),
        ("Does the job well", "Been using it for two weeks. Works as described. Slightly heavier than I imagined from the photos."),
        ("Recommended with a caveat", "Great product, but do check the size chart carefully before ordering. Mine fit well after I sized up."),
    ],
    3: [
        ("Decent but not outstanding", "It works fine for everyday use, but I expected a bit more polish for the money. Average purchase overall."),
        ("Okay for the price", "No major issues, though the finish feels a little cheap in places. Serves the purpose."),
        ("Mixed feelings", "Functionally fine, but the colour is slightly different from the pictures. Returns process was easy at least."),
    ],
    2: [
        ("Not quite what I hoped", "The product itself is usable but one accessory was missing from the box. Support did respond and arranged a replacement."),
        ("Below my expectations", "Quality control could be better. Mine had a small scratch on arrival, though it still works."),
    ],
}

# Coupons seeded into apps.coupons.
# (code, discount_type, value, max_discount, min_order, per_user_limit, days_valid, active)
COUPONS = [
    ("WELCOME10", "PERCENTAGE", 10, 500, 999, 1, 365, True),
    ("NEWUSER100", "FLAT", 100, None, 499, 1, 365, True),
    ("BUYZO500", "FLAT", 500, None, 2999, 2, 180, True),
    ("FESTIVE25", "PERCENTAGE", 25, 2500, 4999, 1, 90, True),
    ("ELECTRO15", "PERCENTAGE", 15, 3000, 9999, 2, 120, True),
    ("FASHION40", "PERCENTAGE", 40, 1200, 1999, 3, 60, True),
    ("BEAUTY20", "PERCENTAGE", 20, 400, 799, 3, 90, True),
    ("HOME750", "FLAT", 750, None, 4999, 1, 120, True),
    ("FREESHIP", "FLAT", 79, None, 0, 5, 365, True),
    ("SUMMER2025", "PERCENTAGE", 30, 1500, 2499, 1, 1, False),
]

# Suppliers used for inbound receipts and purchase orders.
SUPPLIERS = [
    "Reliance Retail Distribution",
    "Ingram Micro India",
    "Redington Distribution Pvt Ltd",
    "Metro Cash & Carry Wholesale",
    "Aditya Birla Fashion Supply",
    "Nykaa Beauty Distribution",
    "Godrej Consumer Depot",
    "Sunrise Logistics & Supply",
]

# Downstream hubs used for outbound shipments and stock transfers.
HUBS = [
    ("Mumbai Central Hub", "Maharashtra"),
    ("Delhi NCR Hub", "Delhi"),
    ("Bengaluru South Hub", "Karnataka"),
    ("Hyderabad Hub", "Telangana"),
    ("Chennai Coastal Hub", "Tamil Nadu"),
    ("Kolkata East Hub", "West Bengal"),
    ("Pune West Hub", "Maharashtra"),
    ("Ahmedabad Hub", "Gujarat"),
]

COURIERS = [
    "BlueDart Express",
    "Delhivery Surface",
    "Ekart Logistics",
    "DTDC Express",
    "XpressBees",
    "BuyZo Own Fleet",
]

RETURN_REASONS = [
    "Size did not fit as expected",
    "Received a different colour than ordered",
    "Product damaged in transit",
    "Changed mind after ordering",
    "Item not as described on the listing",
    "Found a better price elsewhere",
    "Accessory missing from the box",
]

# Warehouse bin locations, cycled deterministically per SKU.
BIN_ZONES = ["A", "B", "C", "D", "E", "F"]
