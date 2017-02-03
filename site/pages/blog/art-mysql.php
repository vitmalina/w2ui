MySQL vs Postgres

I foresee this pots will be very unpopular with some developer community, but here goes nothing.

1. Created a table with VC(65535) or 100 columns of VC(600) because mysql support comulative number of vc size to be 65525

--- 
Error Code: 1118. Row size too large. The maximum row size for the used table type, not counting BLOBs, is 65535. You have to change some columns to TEXT or BLOBs
---

2. If you have INNODB you have foreign keys, if MyASM you get full text search.

There is a hard limit of 4096 columns per table

3. Error Messages are Cryptic. Sometimes you cannot guess where the problem is and it does not give you line

----

Oracle vs Postgres

1. Error messages are cryptic

2. Schema is a user

3. LISTAGG - works only with VC2, CONCAT or || works with VC2 also too

