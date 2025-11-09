/*
  # Remove unique constraint on artisans telephone
  
  1. Changes
    - Drop UNIQUE constraint on artisans.telephone column
    - Multiple artisans can have empty or same telephone numbers
    
  2. Reasoning
    - During signup, telephone might be empty initially
    - Multiple artisans shouldn't be blocked from having empty phones
    - Email is already unique and sufficient for identification
*/

-- Drop the unique constraint on telephone
ALTER TABLE artisans 
DROP CONSTRAINT IF EXISTS artisans_telephone_key;