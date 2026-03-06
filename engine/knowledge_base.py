disease_database = {

# --- GROUP 1: PARASITES (THE MOST COMMON) ---

"Flea Bites": {

    "lesions": ["redness", "hair_loss"],

    "symptoms": ["itching", "black_specks", "redness", "scabs"],

    "description": "Tiny jumping insects that drink blood. Even one flea can cause intense scratching and small red bumps.",

    "cause": "Infestation by Ctenocephalides felis fleas.",

    "treatment": "Oral NexGard (Afoxolaner) or topical Frontline (Fipronil)."

},

"Tick Attachment": {

    "lesions": ["redness"],

    "symptoms": ["Black_spots", "swelling", "redness", "Pain","lethargy"],

    "description": "Slow-moving parasites that bury their heads into the skin. They can cause local swelling and transmit Lyme disease.",

    "anchors": ["tick", "attached_bug"],
    "cause": "External attachment of Ixodidae ticks.",

    "treatment": "Physical removal with tweezers and Bravecto (Fluralaner)."
},

"Sarcoptic Mange (Scabies)": {

    "lesions": ["hair_loss", "scaling"],

    "symptoms": ["intense_itching", "crusting", "redness", "scabs"],

    "description": "Highly contagious mites that burrow under the skin. It causes the most extreme itching seen in dogs.",

    "cause": "Sarcoptes scabiei mites caught from other animals.",

    "treatment": "Revolution (Selamectin) or Simparica (Sarolaner)."

},

"Demodex Mange": {

    "lesions": ["hair_loss", "redness"],

    "symptoms": ["thinning_fur", "redness", "scaling", "no_itching"],

    "description": "Mites that live in hair follicles. Usually starts with small bald patches around the eyes and muzzle.",

    "cause": "Overgrowth of Demodex mites due to weak immunity.",

    "treatment": "Ivermectin or Advocate (Imidacloprid/Moxidectin)."

},

"Ear Mites": {

    "lesions": ["scaling", "redness"],

    "symptoms": ["head_shaking", "black_ear_wax", "itching", "redness"],

    "description": "Microscopic parasites living in the ear canal. They produce a discharge that looks like coffee grounds.",

    "cause": "Otodectes cynotis mite infection.",

    "treatment": "Tresaderm ear drops or Milbemite otic solution."

},

"Lice Infestation": {

    "lesions": ["scaling", "hair_loss"],

    "symptoms": ["itching", "dry_coat", "visible_white_nits", "redness"],

    "description": "Small wingless insects that crawl through the fur. You can often see their white eggs (nits) stuck to hair shafts.",

    "cause": "Direct contact with an infested dog or bedding.",

    "treatment": "Permethrin-based shampoos or Fipronil spray."

},

"Walking Dandruff": {

    "lesions": ["scaling"],

    "symptoms": ["heavy_dandruff", "itching", "scaling", "redness"],

    "description": "Large mites that look like moving flakes of skin. They usually stay along the dog's back.",

    "cause": "Cheyletiella mite infestation.",

    "treatment": "Lime sulfur dips and oral Ivermectin."

},

"Chiggers": {

    "lesions": ["redness"],

    "symptoms": ["orange_dots", "itching", "redness", "bumps"],

    "description": "Tiny orange mites that gather on the belly and between toes after a dog walks through tall grass.",

    "cause": "Trombiculid mite larvae attachment.",

    "treatment": "Epsom salt baths and topical hydrocortisone."

},

"Hookworm Dermatitis": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["itchy_paws", "red_lines", "swelling", "pain"],

    "description": "Parasite larvae from the soil that burrow into the skin of the paws, causing 'creeping' red tracks.",

    "cause": "Larvae of Ancylostoma hookworms in contaminated dirt.",

    "treatment": "Oral Fenbendazole and cleaning up the environment."

},

"Fly Strike": {

    "lesions": ["pus", "wet_lesion"],

    "symptoms": ["bleeding_ears", "crusting", "pain", "flies_circling"],

    "description": "Biting flies that attack the tips of a dog's ears, leaving bloody, crusty sores.",

    "cause": "Stable flies (Stomoxys calcitrans) biting thin skin.",

    "treatment": "Fly repellent ointments and cleaning with Chlorhexidine."

},



# --- GROUP 2: FUNGAL & YEAST ---

"Ringworm": {

    "lesions": ["scaling", "hair_loss"],

    "symptoms": ["circular_patch", "red_rings", "brittle_hair", "crusting"],

    "description": "Not a worm, but a fungus. It creates perfect circles of hair loss that can spread to humans.",

    "cause": "Fungal infection from the environment or other pets.",

    "treatment": "Griseofulvin tablets and Miconazole antifungal cream."

},

"Yeast Overgrowth": {

    "lesions": ["redness", "scaling"],

    "symptoms": ["stinky_skin", "greasy_fur", "itching", "thick_skin"],

    "description": "A fungus that loves moisture. It makes the dog smell like 'corn chips' or 'moldy bread'.",

    "cause": "Malassezia yeast growing too fast due to humidity/allergies.",

    "treatment": "Ketoconazole shampoo and oral Fluconazole."

},

"Skin Fold Fungus": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["bad_odor", "redness", "moist_skin", "itching"],

    "description": "Infection trapped in the deep wrinkles of breeds like Bulldogs or Pugs.",

    "cause": "Bacteria and yeast trapped in skin folds with no airflow.",

    "treatment": "Medicated wipes (Chlorhexidine/Ketoconazole) and drying powders."

},

"Nail Bed Fungus": {

    "lesions": ["scaling", "pus"],

    "symptoms": ["red_nails", "nail_chewing", "swelling", "brittle_claws"],

    "description": "Infection around the base of the claw. The nails may turn reddish-brown or become very weak.",

    "cause": "Fungal invasion of the nail bed, often from digging in dirt.",

    "treatment": "Itra-Fungol (Itraconazole) and antifungal foot soaks."

},

"Sporotrichosis": {

    "lesions": ["pus", "wet_lesion"],

    "symptoms": ["draining_sores", "lumps", "swelling", "fever"],

    "description": "A rare but serious fungal infection caught from thorns or wood. It creates hard lumps that leak fluid.",

    "cause": "Sporothrix fungus entering through a puncture wound.",

    "treatment": "Potassium Iodide solution or oral Itraconazole."

},



# --- GROUP 3: BACTERIAL INFECTIONS ---

"Surface Infection (Pyoderma)": {

    "lesions": ["redness", "pus"],

    "symptoms": ["pimples", "pustules", "redness", "itching"],

    "description": "A common 'staph' infection. It looks like small whiteheads or red bumps across the belly.",

    "cause": "Normal skin bacteria overgrowing because of a scratch or allergy.",

    "treatment": "Cephalexin antibiotics and Benzoyl Peroxide wash."

},

"Deep Infection": {

    "lesions": ["pus", "wet_lesion"],

    "symptoms": ["oozing_blood", "deep_sores", "pain", "swelling"],

    "description": "A severe infection that reaches the deep layers of skin. It often leaves scars and permanent hair loss.",

    "cause": "Uncontrolled surface infection or foreign objects under skin.",

    "treatment": "Long-term Enrofloxacin (Baytril) and wound debridement."

},

"Puppy Acne": {

    "lesions": ["pus", "redness"],

    "symptoms": ["chin_bumps", "blackheads", "swelling", "bleeding"],

    "description": "Red bumps and pimples on the chin and lips of teenage dogs. Common in short-haired breeds.",

    "cause": "Hormones and irritation from plastic food bowls.",

    "treatment": "Mupirocin (Bactoderm) ointment and switching to metal bowls."

},

"Puppy Impetigo": {

    "lesions": ["pus"],

    "symptoms": ["yellow_blisters", "peeling_skin", "redness", "scabs"],

    "description": "Small, fragile blisters filled with yellow pus on the hairless belly of puppies.",

    "cause": "Staphylococcus bacteria in a dirty environment.",

    "treatment": "Gentamicin spray and improved hygiene."

},

"Wet Eczema (Hot Spot)": {

    "lesions": ["wet_lesion", "redness"],

    "symptoms": ["rapid_spread", "pain", "weeping_skin", "hair_loss"],

    "description": "A raw, red area that appears overnight. The dog will lick it until it becomes a bloody mess.",

    "cause": "Self-chewing due to a bug bite or stress.",

    "treatment": "Prednisone (for itch) and topical Betamethasone."

},

"Folliculitis": {

    "lesions": ["redness", "pus"],

    "symptoms": ["bumps_around_hair", "crusting", "scaling", "hair_loss"],

    "description": "Infection of the hair roots. It makes the fur look 'moth-eaten' with small circular crusts.",

    "cause": "Bacteria invading the hair follicle opening.",

    "treatment": "Clindamycin antibiotics and Chlorhexidine baths."

},

"Bacterial Overgrowth (BOG)": {

    "lesions": ["redness"],

    "symptoms": ["greasy_skin", "itching", "redness", "mild_odor"],

    "description": "An imbalance where the skin feels sticky and red, but there are no actual pimples or pustules.",

    "cause": "Secondary to chronic allergies.",

    "treatment": "Daily medicated wipes and Apoquel for itching."

},

"Abscess": {

    "lesions": ["pus", "redness"],

    "symptoms": ["large_lump", "heat", "pain", "fever"],

    "description": "A painful pocket of pus under the skin, usually caused by a bite or a splinter.",

    "cause": "Bacteria trapped deep in the tissue after a puncture.",

    "treatment": "Surgical drainage and Clavamox (Amoxicillin/Clavulanate)."

},

"Cellulitis": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["severe_swelling", "firm_skin", "extreme_pain", "fever"],

    "description": "A spreading infection under the skin that makes the area feel hard, hot, and very painful.",

    "cause": "Aggressive bacteria entering through a wound.",

    "treatment": "Injectable antibiotics and warm compresses."

},

"Interdigital Cyst": {

    "lesions": ["pus", "redness"],

    "symptoms": ["toe_swelling", "limping", "licking_paws", "bleeding"],

    "description": "Painful red bumps that grow between a dog's toes. They often burst and then return.",

    "cause": "Deep bacterial infection or ingrown hairs between toes.",

    "treatment": "Oral antibiotics and sometimes surgical removal."

},



# --- GROUP 4: ALLERGIES ---

"Pollin Allergy (Atopy)": {

    "lesions": ["redness", "hair_loss"],

    "symptoms": ["paw_chewing", "face_rubbing", "ear_infections", "redness"],

    "description": "Like human hay fever, but it makes dogs itchy instead of sneezy. It is usually seasonal.",

    "cause": "Breathing in or touching pollen, grass, or dust mites.",

    "treatment": "Cytopoint injections or Atopica (Cyclosporine)."

},

"Food Allergy": {

    "lesions": ["redness"],

    "symptoms": ["chronic_ear_infections", "itchy_butt", "redness", "hives"],

    "description": "A reaction to food proteins. It often causes itchy ears and paws year-round.",

    "cause": "Immune reaction to chicken, beef, or dairy.",

    "treatment": "Hydrolyzed protein diet (e.g., Hill's z/d) and Omega oils."

},

"Contact Allergy": {

    "lesions": ["redness"],

    "symptoms": ["belly_rash", "itching", "redness", "swelling"],

    "description": "A rash that only appears where the dog touches something, like a new carpet or lawn chemical.",

    "cause": "Skin contact with chemicals, cleaners, or specific plants.",

    "treatment": "Benadryl (Diphenhydramine) and washing the skin with cool water."

},

"Hives (Urticaria)": {

    "lesions": ["redness"],

    "symptoms": ["raised_bumps", "swelling", "sudden_onset", "itching"],

    "description": "Sudden itchy bumps that pop up all over the body. Often seen after a bee sting or vaccine.",

    "cause": "Immediate allergic reaction to an insect or chemical.",

    "treatment": "Dexamethasone injection or Benadryl."

},

"Saliva Staining": {

    "lesions": ["redness"],

    "symptoms": ["pink_fur", "constant_licking", "redness", "wet_skin"],

    "description": "The fur turns pink or rusty brown because the dog won't stop licking the area due to itchiness.",

    "cause": "Chronic licking caused by underlying allergies or pain.",

    "treatment": "Identify the allergy and use Apoquel to stop licking."

},



# --- GROUP 5: HORMONAL & INTERNAL ---

"Low Thyroid (Hypothyroidism)": {

    "lesions": ["hair_loss", "scaling"],

    "symptoms": ["rat_tail", "weight_gain", "cold_intolerance", "dull_coat"],

    "description": "The 'rat tail' disease. Hair thins out on the tail and sides, and the dog becomes lazy.",

    "cause": "The thyroid gland stops making enough hormone.",

    "treatment": "Levothyroxine (Thyro-Tabs) for life."

},

"Cushing’s Disease": {

    "lesions": ["hair_loss"],

    "symptoms": ["thin_skin", "pot_belly", "increased_thirst", "dark_spots"],

    "description": "Causes the skin to become thin like tissue paper and the belly to sag. Hair loss is usually symmetrical.",

    "cause": "Body produces too much cortisol (stress hormone).",

    "treatment": "Vetoryl (Trilostane) capsules."

},

"Sertoli Cell Tumor": {

    "lesions": ["hair_loss", "redness"],

    "symptoms": ["enlarged_nipples", "symmetrical_hair_loss", "attracting_males", "swelling"],

    "description": "A male dog starts looking more 'female' due to high estrogen from a testicular tumor.",

    "cause": "A specific type of tumor in an un-neutered male dog.",

    "treatment": "Neutering (Surgical removal of testicles)."

},

"Alopecia X": {

    "lesions": ["hair_loss"],

    "symptoms": ["black_skin", "total_trunk_baldness", "no_itching", "fuzzy_regrowth"],

    "description": "Also called 'Black Skin Disease'. The dog loses all fur on its body but keeps it on the head.",

    "cause": "Hormonal imbalance common in Pomeranians and Chows.",

    "treatment": "Melatonin and skin supplements."

},

"Seasonal Baldness": {

    "lesions": ["hair_loss"],

    "symptoms": ["flank_hair_loss", "dark_skin", "symmetrical_spots", "no_itching"],

    "description": "Bald patches appear on the dog's sides during winter and often grow back in summer.",

    "cause": "Lack of sunlight affecting the pineal gland and hair growth.",

    "treatment": "Sunlight exposure and Melatonin."

},

"Diabetes Skin Issues": {

    "lesions": ["scaling", "pus"],

    "symptoms": ["slow_healing", "frequent_infections", "dry_skin", "excess_thirst"],

    "description": "Dogs with diabetes heal very slowly and get skin infections much more easily.",

    "cause": "High blood sugar damaging the skin's ability to repair itself.",

    "treatment": "Insulin therapy and high-protein diet."

},

"Liver Skin Syndrome": {

    "lesions": ["scaling", "redness"],

    "symptoms": ["crusty_paws", "sores_around_mouth", "lethargy", "scaling"],

    "description": "A very serious sign of liver failure where the paws and face become extremely crusty.",

    "cause": "Liver disease preventing the skin from getting nutrients.",

    "treatment": "Liver support (Denamarin) and IV amino acids."

},



# --- GROUP 6: AUTOIMMUNE ---

"Lupus (Nose Disease)": {

    "lesions": ["redness", "scaling"],

    "symptoms": ["smooth_nose", "loss_of_nose_color", "crusting", "bleeding"],

    "description": "The 'Collie Nose'. The leathery texture of the nose disappears and becomes smooth and red.",

    "cause": "The immune system attacks the pigment in the nose.",

    "treatment": "Tacrolimus ointment and avoiding direct sun."

},

"Pemphigus Foliaceus": {

    "lesions": ["pus", "scaling"],

    "symptoms": ["honey_crusts", "sore_paws", "redness", "hair_loss"],

    "description": "Large yellowish crusts that look like dried honey, starting on the face and spreading to the feet.",

    "cause": "The body attacks the glue that holds skin cells together.",

    "treatment": "Prednisone and Azathioprine (Immunosuppressants)."

},

"Sebaceous Adenitis": {

    "lesions": ["scaling", "hair_loss"],

    "symptoms": ["silver_scales", "foul_odor", "hair_loss", "brittle_fur"],

    "description": "The oil glands in the skin are destroyed, leading to silver-colored scales and a very smelly coat.",

    "cause": "Immune system destroys the skin's oil-producing glands.",

    "treatment": "Cyclosporine and frequent oil soaks."

},

"Uveodermatologic Syndrome": {

    "lesions": ["redness", "hair_loss"],

    "symptoms": ["whiting_of_fur", "eye_pain", "loss_of_skin_color", "redness"],

    "description": "The dog's fur and skin turn white, and the eyes become very painful and red.",

    "cause": "Immune system attacks pigment cells in eyes and skin.",

    "treatment": "Prednisolone eye drops and oral steroids."

},



# --- GROUP 7: GENETIC & BREED SPECIFIC ---

"Ichthyosis (Fish Skin)": {

    "lesions": ["scaling"],

    "symptoms": ["large_scales", "flaking", "rough_skin", "dry_coat"],

    "description": "The dog produces massive flakes of skin that look like fish scales. Common in Golden Retrievers.",

    "cause": "A genetic defect in how skin cells are formed.",

    "treatment": "Propylene glycol sprays and fatty acid supplements."

},

"Color Dilution Baldness": {

    "lesions": ["hair_loss", "scaling"],

    "symptoms": ["thinning_fur", "bumps_on_skin", "brittle_hair", "no_itching"],

    "description": "Affects 'blue' or 'fawn' dogs. The hair starts breaking off until the dog is partially bald.",

    "cause": "Genetic defect in the pigment of the hair shaft.",

    "treatment": "Vitamin A and medicated shampoos to prevent infection."

},

"Black Hair Dysplasia": {

    "lesions": ["hair_loss"],

    "symptoms": ["bald_black_spots", "white_hair_normal", "no_itching", "scaling"],

    "description": "A strange condition where only the black hair on a multi-colored dog falls out.",

    "cause": "Genetic defect specifically affecting black pigment follicles.",

    "treatment": "No cure; manage skin with moisturizers."

},

"Schnauzer Back Bumps": {

    "lesions": ["pus", "scaling"],

    "symptoms": ["blackheads", "bumps_on_spine", "crusting", "redness"],

    "description": "Also called 'Comedo Syndrome'. Large blackheads and pimples form along the dog's spine.",

    "cause": "Genetic clogging of hair follicles in Schnauzers.",

    "treatment": "Benzoyl Peroxide gel and medicated baths."

},

"Bulldog Tail Fold Infection": {

    "lesions": ["wet_lesion", "pus"],

    "symptoms": ["bad_odor", "pain", "redness", "discharge"],

    "description": "Severe infection in the 'screw tail' or tail pocket where moisture is trapped.",

    "cause": "Skin-on-skin friction and lack of hygiene in tail deep folds.",

    "treatment": "Antiseptic wipes and surgical 'tail amputation' in severe cases."

},



# --- GROUP 8: PHYSICAL INJURIES ---

"Sunburn": {

    "lesions": ["redness"],

    "symptoms": ["peeling", "pain", "heat", "redness"],

    "description": "Red, painful skin caused by too much sun. Most common on white noses and thin-furred bellies.",

    "cause": "UV radiation damage from sunlight.",

    "treatment": "Aloe Vera gel and silver sulfadiazine cream."

},

"Frostbite": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["cold_skin", "swelling", "discoloration", "pain"],

    "description": "Damage from extreme cold. The tips of the ears or tail may turn blue, then red, then black.",

    "cause": "Freezing of skin tissue in winter weather.",

    "treatment": "Slow rewarming and antibiotics to prevent gangrene."

},

"Brush Burn": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["scrapes", "stinging", "redness", "hair_loss"],

    "description": "Irritation caused by harsh grooming brushes or clippers used too close to the skin.",

    "cause": "Friction and minor scrapes from grooming tools.",

    "treatment": "Soothing oatmeal spray and Neosporin."

},

"Rain Rot": {

    "lesions": ["scaling", "pus"],

    "symptoms": ["tufted_hair", "scabs", "scaling", "moist_skin"],

    "description": "A bacterial infection common in dogs left out in wet weather. Fur comes out in clumps with scabs attached.",

    "cause": "Dermatophilus bacteria thriving in constant moisture.",

    "treatment": "Keeping the dog dry and Chlorhexidine shampoo."

},

"Burn (Thermal)": {

    "lesions": ["wet_lesion", "redness"],

    "symptoms": ["blisters", "charred_skin", "extreme_pain", "hair_loss"],

    "description": "Skin damage from heat, hot water, or chemicals. Requires immediate emergency care.",

    "cause": "Contact with fire, boiling water, or heating pads.",

    "treatment": "Silver Sulfadiazine (Silvadene) and strong pain meds."

},



# --- GROUP 9: GROWTHS & LUMPS ---

"Skin Tags": {

    "lesions": ["redness"],

    "symptoms": ["fleshy_growth", "stalk_like", "no_pain", "slow_growth"],

    "description": "Harmless fleshy bumps that hang off the skin. Very common in older dogs.",

    "cause": "Friction or age-related skin growth.",

    "treatment": "Usually nothing; surgical removal if it catches on things."

},

"Warts (Papilloma)": {

    "lesions": ["redness", "scaling"],

    "symptoms": ["cauliflower_growth", "mouth_bumps", "multiple_lumps", "no_pain"],

    "description": "Bumpy, cauliflower-looking growths usually found around the mouth of young dogs.",

    "cause": "A contagious virus caught from other dogs.",

    "treatment": "Usually goes away on its own in 1-3 months."

},

"Fatty Tumor (Lipoma)": {

    "lesions": ["redness"],

    "symptoms": ["soft_lump", "movable_mass", "no_pain", "slow_growth"],

    "description": "A soft, squishy ball of fat under the skin. Almost always harmless but can get very large.",

    "cause": "Age and genetics causing fat cells to cluster.",

    "treatment": "Monitoring size or surgical removal if it blocks movement."

},

"Histiocytoma (Button Tumor)": {

    "lesions": ["redness"],

    "symptoms": ["red_raised_bump", "hair_loss_on_bump", "fast_growth", "single_lump"],

    "description": "A bright red, hairless 'button' that appears suddenly on young dogs. Usually benign.",

    "cause": "Overgrowth of certain immune cells.",

    "treatment": "Wait-and-see; they often disappear after 2 months."

},

"Sebaceous Cyst": {

    "lesions": ["pus", "scaling"],

    "symptoms": ["hard_lump", "cheesy_discharge", "redness", "swelling"],

    "description": "A blocked oil gland that forms a hard kernel. If it pops, a thick 'toothpaste' material comes out.",

    "cause": "Clogged pore or oil gland.",

    "treatment": "Warm compresses and surgical excision."

},

"Mast Cell Tumor": {

    "lesions": ["redness", "swelling"],

    "symptoms": ["changing_size_lump", "redness", "itching", "bleeding"],

    "description": "The most dangerous skin cancer. It can look like a simple bump but spread internally.",

    "cause": "Cancerous mutation of immune cells.",

    "treatment": "Surgery and Palladia (Toceranib) chemotherapy."

},

"Melanoma": {

    "lesions": ["redness"],

    "symptoms": ["dark_lump", "bleeding", "swelling", "fast_growth"],

    "description": "A dark-pigmented tumor. If found in the mouth or on the toes, it is often very aggressive.",

    "cause": "Cancer of the pigment-producing cells.",

    "treatment": "Surgery and the Oncept melanoma vaccine."

},

"Squamous Cell Carcinoma": {

    "lesions": ["wet_lesion", "redness"],

    "symptoms": ["non_healing_sore", "crusting", "bleeding", "redness"],

    "description": "A crusty, red sore that refuses to heal. Often found on the nose or ears of white dogs.",

    "cause": "Chronic sun damage causing skin cancer.",

    "treatment": "Surgical removal and radiation therapy."

},

"Soft Tissue Sarcoma": {

    "lesions": ["redness"],

    "symptoms": ["firm_lump", "deeply_attached", "painless", "slow_growth"],

    "description": "A firm lump that feels like it is 'stuck' to the muscle or bone underneath.",

    "cause": "Cancerous growth of connective tissues.",

    "treatment": "Wide surgical removal and radiation."

},



# --- GROUP 10: OTHER CONDITIONS ---

"Lick Granuloma": {

    "lesions": ["wet_lesion", "hair_loss"],

    "symptoms": ["constant_licking", "thickened_skin", "redness", "pain"],

    "description": "A thick, hard patch on the wrist or ankle caused by the dog licking the same spot for hours.",

    "cause": "Boredom, anxiety, or OCD in dogs.",

    "treatment": "Fluoxetine (Prozac) and bitter spray bandages."

},

"Dandruff (Dry Skin)": {

    "lesions": ["scaling"],

    "symptoms": ["white_flakes", "dry_coat", "mild_itching", "scaling"],

    "description": "Simple dry skin that causes white flakes to appear on the fur and bedding.",

    "cause": "Low humidity, poor diet, or too many baths.",

    "treatment": "Omega-3 fish oil and moisturizing conditioners."

},

"Oily Skin (Seborrhea)": {

    "lesions": ["scaling"],

    "symptoms": ["greasy_coat", "bad_odor", "yellow_flakes", "redness"],

    "description": "The dog feels greasy to the touch and has a heavy 'doggy' smell even after a bath.",

    "cause": "Overactive oil glands often caused by underlying disease.",

    "treatment": "Selenium Sulfide shampoo (Selsun Blue type for dogs)."

},

"Callus (Elbow Sore)": {

    "lesions": ["scaling", "hair_loss"],

    "symptoms": ["thick_gray_skin", "hair_loss", "no_pain", "scaling"],

    "description": "Thick, leathery gray patches on the elbows of big dogs that sleep on hard floors.",

    "cause": "Repeated pressure and friction on hard surfaces.",

    "treatment": "Soft bedding and Bag Balm moisturizer."

},

"Zinc Deficiency": {

    "lesions": ["scaling", "redness"],

    "symptoms": ["crusty_mouth", "sore_eyes", "thick_pads", "hair_loss"],

    "description": "Thick, red crusts around the mouth and eyes. Common in northern breeds like Huskies.",

    "cause": "Inability to absorb zinc from standard dog food.",

    "treatment": "Zinc Methionine supplements."

},

"Vitamin A Responsive Skin": {

    "lesions": ["scaling", "pus"],

    "symptoms": ["plugged_follicles", "heavy_crusting", "scaling", "hair_loss"],

    "description": "The skin becomes covered in thick, 'frond-like' crusts. Common in Cocker Spaniels.",

    "cause": "Genetic need for much higher Vitamin A levels.",

    "treatment": "High-dose Vitamin A (Retinoids)."

},

"Nasal Hyperkeratosis": {

    "lesions": ["scaling"],

    "symptoms": ["crusty_nose", "cracked_skin", "dryness", "thick_skin"],

    "description": "The nose becomes very dry and grows thick, 'hairy' looking crusts on top.",

    "cause": "Age or genetics causing excess keratin growth on the nose.",

    "treatment": "Snout Soother or Vaseline."

},
"Paw Pad Hyperkeratosis": {

    "lesions": ["scaling"],

    "symptoms": ["hairy_paws", "cracked_pads", "pain", "limping"],

    "description": "The paw pads grow extra 'hairy' skin that makes it painful for the dog to walk on hard ground.",

    "cause": "Excess keratin production on the feet.",

    "treatment": "Trimming the excess skin and foot soaks."

},

"Feline Acne (if needed, but for dogs): Dog Chin Acne": {

    "lesions": ["pus", "redness"],

    "symptoms": ["blackheads", "pimples", "swelling", "redness"],

    "description": "Clogged pores on the chin that can turn into painful, bleeding abscesses.",

    "cause": "Bacteria and oily skin, often from plastic bowls.",

    "treatment": "Benzoyl Peroxide and switching to glass bowls."

},

"Swimming Ear (Otitis)": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["ear_pain", "smelly_ears", "head_tilt", "discharge"],

    "description": "Infection and inflammation of the ear canal. Common after swimming or baths.",

    "cause": "Water trapped in the ear allowing bacteria to grow.",

    "treatment": "Otomax or Posatex ear drops."

},

"Aural Hematoma": {

    "lesions": ["redness", "swelling"],

    "symptoms": ["balloon_ear", "heavy_ear", "heat", "pain"],

    "description": "The ear flap fills with blood and feels like a warm, squishy balloon.",

    "cause": "Violent head shaking causing a blood vessel to burst in the ear flap.",

    "treatment": "Surgical drainage and treating the ear infection."

},

"Solar Dermatitis": {

    "lesions": ["redness", "scaling"],

    "symptoms": ["red_skin", "thinning_fur", "peeling", "crusting"],

    "description": "Chronic sun damage that makes the skin look 'leathery' and red. Can lead to cancer.",

    "cause": "Long-term exposure to sunlight in white or thin-haired dogs.",

    "treatment": "Keeping the dog indoors during peak sun and sunsuits."

},

"Vitiligo": {

    "lesions": ["hair_loss"],

    "symptoms": ["white_patches", "loss_of_nose_color", "no_itching", "no_pain"],

    "description": "The dog's skin and fur lose their color and turn white in patches. It is purely cosmetic.",

    "cause": "Immune system destroying pigment cells.",

    "treatment": "No treatment needed; it's a 'fashion' change."

},

"Dermoid Sinus": {

    "lesions": ["pus"],

    "symptoms": ["hole_on_back", "leaking_fluid", "pain", "swelling"],

    "description": "A small hole or tube on the dog's back that leads deep into the tissue. Common in Ridgebacks.",

    "cause": "A birth defect where skin doesn't close properly over the spine.",

    "treatment": "Surgical removal of the sinus tube."

},

"Follicular Dysplasia": {

    "lesions": ["hair_loss"],

    "symptoms": ["patchy_baldness", "poor_coat", "no_itching", "scaling"],

    "description": "The hair follicles don't develop right, causing the dog to have a thin, 'moth-eaten' coat.",

    "cause": "Genetic defect in hair growth.",

    "treatment": "Melatonin and high-quality protein diet."

},

"Calcinosis Cutis": {

    "lesions": ["scaling", "redness"],

    "symptoms": ["hard_white_bumps", "gritty_skin", "redness", "pain"],

    "description": "Calcium deposits form hard, gritty white rocks inside the skin. Very painful.",

    "cause": "Usually a side effect of high-dose steroids or Cushing's disease.",

    "treatment": "Treating the underlying disease and DMSO gel."

},

"Psychogenic Licking": {

    "lesions": ["wet_lesion", "hair_loss"],

    "symptoms": ["licking_paws", "wet_fur", "redness", "anxiety"],

    "description": "The dog licks its paws or legs constantly due to stress or boredom, not because it's itchy.",

    "cause": "Separation anxiety or lack of mental exercise.",

    "treatment": "Reconcile (Fluoxetine) and more playtime/exercise."

},

"Hepatocutaneous Syndrome": {

    "lesions": ["scaling", "redness"],

    "symptoms": ["crusted_paws", "sores_around_mouth", "lethargy", "pain"],

    "description": "Extreme crusting of the footpads and face, indicating the liver is failing.",

    "cause": "Advanced liver disease or a pancreatic tumor.",

    "treatment": "High-protein diet and IV nutritional support."

},

"Epitheliotropic Lymphoma": {

    "lesions": ["redness", "scaling"],

    "symptoms": ["red_skin_all_over", "extreme_itching", "scaling", "sores"],

    "description": "A rare skin cancer that looks like a severe allergy or 'red dog' syndrome.",

    "cause": "Cancerous T-cells invading the skin layers.",

    "treatment": "CCNU (Lomustine) chemotherapy."

},

"Sterile Panniculitis": {

    "lesions": ["pus", "wet_lesion"],

    "symptoms": ["lumps_under_skin", "oozing_oil", "fever", "pain"],

    "description": "Inflammation of the fat layer under the skin. It causes oily, bloody fluid to leak out.",

    "cause": "Immune system attacking the fat cells.",

    "treatment": "Cyclosporine and Vitamin E."

},

"Lupus (Systemic)": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["joint_pain", "fever", "skin_sores", "lethargy"],

    "description": "A serious body-wide disease where the immune system attacks joints, kidneys, and skin.",

    "cause": "General autoimmune failure.",

    "treatment": "Prednisone and lifelong monitoring."

},

"Tail Biting (Obsessive)": {

    "lesions": ["wet_lesion", "hair_loss"],

    "symptoms": ["mutilated_tail", "spinning", "bleeding", "pain"],

    "description": "The dog attacks its own tail, causing severe wounds and bleeding.",

    "cause": "Anxiety or nerve pain in the tail/spine.",

    "treatment": "Gabapentin for nerve pain and Clomipramine for anxiety."

},

"Fly Bite Sensitivity": {

    "lesions": ["redness", "scaling"],

    "symptoms": ["crusty_ear_tips", "itching", "redness", "black_scabs"],

    "description": "Small, painful black scabs on the edges of the ears caused by biting flies.",

    "cause": "Allergic reaction to fly saliva.",

    "treatment": "Fly repellent and topical steroid creams."

},

"Scrotal Dermatitis": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["red_scrotum", "licking", "pain", "swelling"],

    "description": "Inflammation and infection of the scrotum. Very painful for the dog.",

    "cause": "Allergy to floor cleaners or bacterial infection.",

    "treatment": "Antibiotic ointment and an E-collar (cone)."

},

"Belly Rash (General)": {

    "lesions": ["redness"],

    "symptoms": ["red_spots", "itching", "licking_belly", "redness"],

    "description": "A general term for red skin on the stomach. Usually the first sign of many allergies.",

    "cause": "Grass allergy or heat rash.",

    "treatment": "Hydrocortisone spray and cooling the dog down."

},

"Pododermatitis (Foot Infection)": {

    "lesions": ["redness", "pus"],

    "symptoms": ["swollen_paws", "redness", "limping", "licking_feet"],

    "description": "General inflammation of the feet. The paws look red and 'beefy'.",

    "cause": "Allergies or walking on irritating surfaces.",

    "treatment": "Medicated foot soaks and oral Apoquel."

},

"Cheyletiella (Walking Dandruff)": {

    "lesions": ["scaling"],

    "symptoms": ["moving_flakes", "itching", "scaling", "redness"],

    "description": "Large mites that look like white flakes moving across the dog's fur.",

    "cause": "Contagious mite infection.",

    "treatment": "Selamectin (Revolution)."

},

"Flea Dirt": {

    "lesions": ["redness"],

    "symptoms": ["black_pepper_spots", "itching", "redness", "scratches"],

    "description": "Not a disease itself, but a sign of fleas. The 'dirt' is actually flea droppings.",

    "cause": "Active flea infestation.",

    "treatment": "Flea bath and Capstar tablets."

},

"Demodex (Generalized)": {

    "lesions": ["hair_loss", "scaling"],

    "symptoms": ["total_hair_loss", "gray_skin", "bad_odor", "redness"],

    "description": "A severe form of mange that covers the entire body, making the dog look 'elephant-skinned'.",

    "cause": "Genetic immune defect allowing mites to take over.",

    "treatment": "Bravecto and antibiotics for skin infections."

},

"Ehrlichiosis (Skin Signs)": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["bruising", "nosebleeds", "red_spots_on_gums", "fever"],

    "description": "A tick-borne disease that causes the blood not to clot, leading to red spots and bruising.",

    "cause": "Ehrlichia bacteria from a tick bite.",

    "treatment": "Doxycycline for 28 days."

},

"Leishmaniasis": {

    "lesions": ["scaling", "hair_loss"],

    "symptoms": ["long_claws", "eye_sores", "weight_loss", "scaling"],

    "description": "A serious parasite from sandflies. It causes skin peeling and weirdly fast-growing claws.",

    "cause": "Leishmania parasite transmitted by sandflies.",

    "treatment": "Allopurinol and Miltefosine."

},

"Blastomycosis (Skin)": {

    "lesions": ["pus", "wet_lesion"],

    "symptoms": ["draining_holes", "limping", "coughing", "fever"],

    "description": "A dangerous fungus from the soil. It creates holes in the skin that leak pus.",

    "cause": "Inhaling fungus spores from wet soil/riverbanks.",

    "treatment": "Itra-Fungol (Itraconazole) for 6 months."

},

"Coccidioidomycosis (Valley Fever)": {

    "lesions": ["pus", "redness"],

    "symptoms": ["skin_lumps", "cough", "joint_swelling", "fever"],

    "description": "A desert fungus that causes skin sores and a deep, dry cough.",

    "cause": "Dust-borne fungus from dry climates (Arizona/California).",

    "treatment": "Oral Fluconazole."

},

"Brucellosis": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["scrotal_swelling", "discharge", "back_pain", "fever"],

    "description": "A contagious bacterial disease that can affect the skin around the genitals.",

    "cause": "Brucella bacteria (Zoonotic - can spread to humans).",

    "treatment": "Streptomycin and Doxycycline."

},

"Lyme Disease (Skin Rash)": {

    "lesions": ["redness"],

    "symptoms": ["bullseye_rash", "limping", "fever", "lethargy"],

    "description": "While rare to see on dogs, a red 'bullseye' can appear at the site of a tick bite.",

    "cause": "Borrelia bacteria from a deer tick.",

    "treatment": "Doxycycline antibiotics."

},

"Hookworm (Skin Penetration)": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["itchy_belly", "red_streaks", "redness", "swelling"],

    "description": "Red itchy lines on the belly where worms have crawled into the skin from the grass.",

    "cause": "Contact with hookworm larvae in the soil.",

    "treatment": "Heartgard Plus or Drontal."

},

"Cuterebra (Warble)": {

    "lesions": ["pus", "wet_lesion"],

    "symptoms": ["hole_in_skin", "moving_lump", "discharge", "pain"],

    "description": "A large fly larva (maggot) that grows under the dog's skin with a breathing hole.",

    "cause": "Botfly larvae burrowing into the skin.",

    "treatment": "Physical removal by a vet (do not squeeze!)."

},

"Pelodera Dermatitis": {

    "lesions": ["redness", "pus"],

    "symptoms": ["extreme_itch", "red_belly", "pus_bumps", "redness"],

    "description": "Small worms from damp straw or bedding that invade the skin of the dog's belly.",

    "cause": "Pelodera larvae from dirty, wet bedding.",

    "treatment": "Ivermectin and burning the old bedding."

},

"Healthy Skin": {

    "lesions": ["normal"],

    "symptoms": [],

    "description": "The dog's skin seems to be healthy, and free of any lumps, flakes, or redness.",

    "cause": "No disease; good health.",

    "treatment": "Maintain monthly prevention and good diet."

},

"Flea Allergy (FAD)": {

    "lesions": ["redness", "hair_loss"],

    "symptoms": ["chewing_back", "scabs", "redness", "itching"],

    "description": "A severe allergy to flea spit. One bite makes the dog chew all the hair off its lower back.",

    "cause": "Hypersensitivity to flea saliva.",

    "treatment": "Comfortis (Spinosad) and Prednisone."

},

"Muzzle Folliculitis": {

    "lesions": ["pus", "redness"],

    "symptoms": ["red_muzzle", "pimples_on_nose", "pain", "bleeding"],

    "description": "Infection of the whiskers and hair on the nose. Very painful when the dog eats or drinks.",

    "cause": "Bacteria from dirty water bowls or rubbing the face.",

    "treatment": "Mupirocin ointment and antiseptic washes."

},

"Pressure Sores": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["open_sores", "hair_loss", "bleeding", "pain"],

    "description": "Wounds that form on the hips and elbows of thin dogs or those that cannot move well.",

    "cause": "Constant pressure on skin over bone.",

    "treatment": "Padded bedding and Zinc Oxide cream (carefully)."

},

"Drug Reaction": {

    "lesions": ["redness", "wet_lesion"],

    "symptoms": ["peeling_skin", "hives", "redness", "swelling"],

    "description": "The skin starts peeling or breaks out in a rash right after the dog takes a new medicine.",

    "cause": "Allergic reaction to a specific drug (like Penicillin).",

    "treatment": "Stop the drug immediately and give Epinephrine/Steroids."

},

"Ear Tip Necrosis": {

    "lesions": ["scaling", "redness"],

    "symptoms": ["black_ear_edges", "cracking", "bleeding", "pain"],

    "description": "The edges of the ears start to die and turn black or crusty. Common in Dobermans.",

    "cause": "Poor blood flow or immune-mediated blood vessel damage.",

    "treatment": "Pentoxifylline to improve blood flow."

},

"Tail Gland Hyperplasia": {

    "lesions": ["hair_loss", "scaling"],

    "symptoms": ["bump_on_tail", "greasy_spot", "hair_loss", "scaling"],

    "description": "An oval-shaped greasy bald spot on the top of the tail. Often called 'Stud Tail'.",

    "cause": "Overactive oil glands on the tail due to hormones.",

    "treatment": "Neutering and medicated shampoo."

},

"Puppy Strangles": {

    "lesions": ["pus", "redness"],

    "symptoms": ["swollen_face", "deep_crusts", "swollen_glands", "fever"],

    "description": "A sudden, scary swelling of a puppy's muzzle and eyes with deep, crusty sores.",

    "cause": "A sudden immune system overreaction in young puppies.",

    "treatment": "High-dose Prednisolone and antibiotics."

},

"Solar Keratosis": {

    "lesions": ["scaling", "redness"],

    "symptoms": ["rough_patches", "hard_skin", "redness", "scaling"],

    "description": "Pre-cancerous crusty spots caused by sun damage. They feel like sandpaper.",

    "cause": "Chronic UV exposure.",

    "treatment": "Imiquimod cream and sun avoidance."

},

"Cold Agglutinin Disease": {

    "lesions": ["redness", "scaling"],

    "symptoms": ["blue_ear_tips", "sores_in_cold", "pain", "scaling"],

    "description": "A rare condition where the blood 'clumps' in the ears and tail when it gets cold.",

    "cause": "Immune system attacking blood cells in low temperatures.",

    "treatment": "Keeping the dog in a warm environment only."

},

"Acral Mutilation Syndrome": {

    "lesions": ["wet_lesion", "hair_loss"],

    "symptoms": ["chewing_off_toes", "no_pain", "bleeding", "hair_loss"],

    "description": "The dog cannot feel its feet, so it accidentally chews its own toes off.",

    "cause": "A genetic nerve defect in certain hunting breeds (like Pointers).",

    "treatment": "Protecting the feet with boots and sedation."

},

"Paraneoplastic Alopecia": {

    "lesions": ["hair_loss"],

    "symptoms": ["shiny_skin", "total_hair_loss", "weight_loss", "lethargy"],

    "description": "Sudden, total hair loss and very shiny skin. Usually a sign of an internal cancer.",

    "cause": "Internal tumor (usually liver or pancreas) affecting the skin.",

    "treatment": "Find and remove the internal tumor."

}

}