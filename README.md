# RL in SRP
An application of reinforcement learning (RL) to the strategic release planning (SRP) problem.

Logic:
1. Given the historical requirements, create a collection of all of the nouns and verbs of those requirements.
    - Use the <a href="https://www.npmjs.com/package/wordpos-web">wordpos-web npm package</a>
2. Given a desired number of requirements (n) for the next iteration, repeat the following steps n times:
    1. Calculate the reward for selecting each term in the historical vocabulary based on how often it appears in the historical documents.
    2. Using the calculated rewards, select a term from the historical vocabulary.
    3. Calculate the reward for selecting each future requirement based on their average textual similarity score when comparing them to the original historical requirements containing that selected term.
        - Use the <a href="https://www.npmjs.com/package/sentence-similarity">sentence-similarity npm package</a>
    4. Using the calculated rewards, select a requirement from the list of available future requirements.
    5. Add this requirement to the list of requirements to be implemented in the next iteration.
    6. Remove the selected requirement from the list of available future requirements and decrease the reward of the selected term by 25%.
3. Print the selected and unselected requirements to separate files.
4. Evaluate the effectiveness of the method (accuracy, precision, recall) using previously planned releases.
