# D3 Project Starter Template
## Data
### The Data
For the [data](Merged_Job_Health.csv), I used the rate for Coronary Heart Disease in link 1, and the Rate of Unemployment in 2021. These were the closest indicators I could get for a correlation between unemployment and stress during the 2021 Computer Science job market crash. Something very important to me.
### Links 
Health Information:
https://nccd.cdc.gov/DHDSPAtlas/?state=State&class=1&subclass=11&theme=161&filters=%5B%5B25,1%5D,%5B23,1%5D,%5B3,1%5D,%5B24,1%5D,%5B7,1%5D%5D

Employment Information:
https://www.ers.usda.gov/data-products/atlas-of-rural-and-small-town-america/go-to-the-atlas#

## GUI
The two main views of the data that I could complete were a scatterplot and a chloropath graph.
### Scatterplot
The Scatterplot graph was designed to visualize the data and isolate any outliers. It was also implemented for me to be able to perceive the data before I implemented the chloropath. The view changes mainly revolve around a tooltip and hovering. It mainly displays an in-depth view of the info. My only complaint was the sheer overlap. I slightly fixed this by implementing a selection feature.

### Chloropleth
The second view was a chloropleth map that had two views mapped by a selector. Each represented a primary statistics. Additionally, there is a tooltip that appears when a county is hovered over. This contains the state, county, and both major stats with the selected one being bolded. Additionally, there is a math implemented that calculates if there is a high correlation index between the two stats with low being both stats below average, medium being one stat above average, and high being both stats at high average. 

## Discovery
I discovered that certain areas are fairly correlated but there was a decently low correlation. With the average, most states fall into a low or medium category with very small averages. The tooltip really helps show this off.

## Process
I accessed and ran my code via the live server implementation in Visual Studio. Most of my process revolved around the actual steps given and a series of severe trial-and-error sections.

## Challenges
### Future Works
One of the things I tried to implement but wasn't able to was the secondary dashboard. I wanted a secondary dashboard that showed off a differentiation. Additionally, I got brushing to work on the scatterplot by accident but it refused to work on the chloro. For the future, fixing brushing and creating that more indepth data view based on selected county would be cool.

### Challenges
For challenges, I had issues with a lot of the flowing implementations. File-to-file connections and that aforementioned secondary dashboard just didn't work.

## AI
AI was used mainly for maintenance. Implementing more micro aspects to features I had already added and intuitive debugging saved me a lot of time. I only used the GitHub Assistant.

## Video
I ran out of time on the video. My graduation was this morning. My apologies.