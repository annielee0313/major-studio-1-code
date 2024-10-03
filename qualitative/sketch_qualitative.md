## Sketch 1: Colors and Pairings

**Visualization:** A mix of a color wheel, radial bar chart, and chord diagram to explore orchid bloom colors and their pairings.

**Research Question:** What colors are most common in blooming orchids, and are there frequent color pairings?

**Data: ~**2135 rows  ****`orchids AND bloom characteristics AND Living botanical specimens AND online_media_type:"Images"`  

Bloom colors will be extracted from the "bloom_characteristics" field, with exact shades identified using Vibrant.js.
![qual_sketch1](https://github.com/user-attachments/assets/db33651f-bb55-4142-9ac0-e77199c0bf6a)


## Sketch 2 **Pollination Syndrome and Fragrance**

- Orchids are often used in perfumes because of their diverse scents, which can range from sweet and lemony to musty.
- Orchids only give off scent when pollinators would normally be around in the orchid's natural habitat. For example, If an orchid in nature is pollinated by a nocturnal butterfly, it will smell at night.

**Visualization:** This project explores the relationship between orchid fragrance and their pollinators, focusing on how orchids release fragrance at specific times, either during the day or night, depending on whether their pollinators are nocturnal or diurnal. The network chart groups orchids based on shared pollinators and fragrance characteristics. A toggle feature allows users to switch between "Day" and "Night" modes, revealing how fragrance timing aligns with pollinator habits.

**Research Question:** How does the timing of orchid fragrance correlate with the activity patterns of their pollinators, and are there observable patterns in fragrance types across different orchid species?

**Pollination Data:** 649 rows `Orchids AND Fragrance AND Pollination Syndrome AND online_media_type:"Images" AND object_type:"Living botanical specimens"`;

- some does specify only (at night) e.g. https://collections.si.edu/search/detail/edanmdm:ofeo-sg_2007-1278C?fq=online_media_type:"Images"&fq=topic:"Orchids"&q=pollination&record=41&hlterm=pollination&inline=true
- Add a **toggle for day & night** → fragrance & pollinator nodes only become visible when night mode is on?
- color coded scent?
![qual_sketch2](https://github.com/user-attachments/assets/5b8b4d1f-9025-44df-804c-f0cf26b553df)


## Sketch 3 Bloom Characteristics

This is an interactive bubble chart exploring if there is a correlation between bloom characteristics and different genus, subgroups, etc. he x-axis plots the flower size, the y-axis plots the inflorescence length, and the bubble size is according to the number of flowers. We can zoom in by filtering the length and size of flower, hover over each bubble for tooltip, and click on them to expand further description. Once expanded, the side bar provides additional information with tags like genus and sub-groups - select the tabs to see orchids of the same tag light up in the bubble chart. 

**Research Question:** How do different bloom characteristics interact across various orchid species? 

**Dataset:** less than 2135 rows  ****`orchids AND bloom characteristics AND Living botanical specimens AND inflorescence AND online_media_type:"Images"`

**Data Cleaning:** filter out those without all three bloom characteristics. identify words like “many flowers” and the different numbers for length, number of flowers, and flower width.
![quant-sketch-2](https://github.com/user-attachments/assets/9a09dae8-4f7c-4d35-948e-c0b37b11a284)


