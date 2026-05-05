<img src="public/logo.svg" alt="Kaizen Logo" width="64" style="background: #666; padding: 0.25rem; border-radius: 100%; margin-bottom: 1rem;" />

## Project requirements

Out of the box, this project allows users to find and reserve vehicles available for a given time range. You will extend the project by fixing the search filter bug described below and by implementing a new discount type.

### **Part 1: Price filter bug**

Some of the hourly rental prices have gotten higher since the app was originally built. Users have reported that they can’t filter out the most expensive rates anymore without also hiding reasonable rates that they would have paid.

Here are two bug reports we've gotten from customers:

> I want to hide results above $125/hr, but I can't figure out how to do that.

> MY BUDGET IS $100 PER HOUR BUT IT'S SHOWING ME VERY EXPENSIVE CARS???

### **Part 2: Discounts**

We'd like to add discounts that satisfy these requirements:

- A reservation that includes a holiday but does not start or end on that holiday should receive a 17% discount off the total price. (A list of fictitious holidays is included below.)
- A reservation for more than 3 days should receive a $10/hr discount on the hourly rate.
- These discounts cannot both apply at the same time. If they conflict, the discount with the best price applies to the reservation.
- Visitors should see the discount reflected during search and checkout, including on the review page.


List of fictitious holidays (10 randomly sampled dates in the year):

- Jan 21
- Feb 12
- Mar 04
- May 02
- Jun 16
- Jul 26
- Aug 03
- Sep 01
- Nov 05
- Dec 18

### **(Bonus) Other improvements**

Any other improvements we should make to this app? (e.g. any UX issues that stand out?)
