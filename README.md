# CARDS

This repository contains the code for a card game with conversation starters. There is a JSON file with the questions and a web application to display them. The game can be played in 2 ways and that does not affect the web app. You can read the question on the card and answer it and the next player can choose to answer the same question or choose a new one. The game has only questions and no answers. 

The JSON supports selections of cards. So when you visit the web app you see a really short introduction and you can choose a set of cards. You can choose all cards, spicy cards, neutral cards and maybe more selections in the future. If there are no selections in the JSON only show all cards. And you can also select if the cards are shuffled or not. If possible the JSON file should be minified or base64 encoded before deployment so it is a little bit harder for users to download the JSON file with all the questions. Of course it cannot be completely avoided that they copy all questions but it should be a bit more difficult.

The layout works on desktop and on mobile. And after the start screen where you choose a set of cards and if the cards are shuffled or not you see a card and you can answer it. You cannot enter an answer, the app only shows the question. 

The question is shown on a card and you can swipe left or right to go to the next question. You cannot go back. There is a small cross in the top right corner to go back to the start screen. On mobile the layout is in landscape mode, so you'll have to turn your phone sideways. The card looks like a rectangular note card with rounded corners. It important that it looks nice. We're targeting a minimalist and functional design.

This is quite a simple app so the technology to use is up to the AI. React might be overkill. Ease of use and maintainability are important. 

Deployment is done by deploying the app to GitHub Pages. There is also a Dockerfile but no pipeline to build the container image. There is a GitHub action to deploy the app to GitHub Pages. The hostname is cards.aike.be. Dependabot is enabled. There should be a robots.txt file to prevent search engines from indexing the app. 

In the future there might be the need to pull questions from a public Google Sheet when the game loads but this should not be implemented yet.