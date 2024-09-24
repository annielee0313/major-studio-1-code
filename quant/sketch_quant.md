# Quantitative Project Sketches
### Sketch 1 → Bloom Time and Life Form
This visualization populates the "northern hemisphere" with bubble thumbnails of the orchids by different months and life forms (epiphytic, terrestrial, and lithophytic). You can toggle between the different life forms and see them comparatively, hover over the thumbnails to learn more and add those you want to see in a separate, exportable list. I envision this as a tool for visitors to explore the different kinds of orchids they would be able to see at different times. There's also an "on-exhibit" tag that could be helpful for those visiting the Smithsonian Gardens.

**Research Question** How do bloom times vary between epiphytic, terrestrial, and lithophytic orchids throughout the year? Is certain life form more seasonally dependent than others?

**Dataset** 1562 Rows with _bloom time_ out of 3512 total Orchid Rows `Orchids AND bloom time AND online_media_type:"Images" AND object_type:"Living botanical specimens"`;\
also helpful: `set_name:”Smithsonian Gardens Orchid Collection” on exhibit: “Yes”`

**Data Cleaning** → bloom months are noted as “February to July” I need to clean it so the computer can recognize it as all the months in between. I also have to make sure there are no repeating objects.

![quant_sketch_1](https://github.com/user-attachments/assets/0ac98969-09c5-44e2-b734-dc5195674169)


### Sketch 2 → Bloom Characteristics of Orchids
This is an interactive bubble chart exploring if there is a correlation between bloom characteristics and different genus, subgroups, etc. he x-axis plots the flower size, the y-axis plots the inflorescence length, and the bubble size is according to the number of flowers. We can zoom in by filtering the length and size of flower, hover over each bubble for tooltip, and click on them to expand further description. Once expanded, the side bar provides additional information with tags like genus and sub-groups - select the tabs to see orchids of the same tag light up in the bubble chart. 

**Research Question:** How do different bloom characteristics interact across various orchid species? 

**Dataset:** less than 2135 rows  ****`orchids AND bloom characteristics AND Living botanical specimens AND inflorescence AND online_media_type:"Images"`

**Data Cleaning:** filter out those without all three bloom characteristics. identify words like “many flowers” and the different numbers for length, number of flowers, and flower width.

![quant-sketch-2](https://github.com/user-attachments/assets/ce027b70-e229-4242-90a9-8286f82c99c1)


### Sketch 3 → Algae Distribution
The tool allows users to zoom into specific regions and switch between a geographic view and a depth view, offering a detailed understanding of algae diversity and habitat preferences.

**Research Question:** How does algae diversity vary with depth across different marine environments?

**Dataset:** 2579 rows `Algae AND depth AND online_media_type:"Images" AND unit_code:"NMNH - Botany Dept."`

**Data:** depth in meters, place (need to get coordinates)

![quant_sketch_3](https://github.com/user-attachments/assets/8be1523a-2746-4d4f-bb5f-5afd434dab5d)




### Quant Mock Up
![quant_mock](https://github.com/user-attachments/assets/2cdd8ed4-4b0b-4320-b94c-78e6746e9b6d)


### Quant Prototype Screenshot
Link: https://annielee0313.github.io/major-studio-1-code/quant/
<img width="1512" alt="quant_prototype_1" src="https://github.com/user-attachments/assets/f821ffe8-4651-45e7-b6a9-33c969b7b8c8">
<img width="1512" alt="quant_prototype_2" src="https://github.com/user-attachments/assets/178f28e3-688a-4b3f-b5a6-e99fc246aa9d">




