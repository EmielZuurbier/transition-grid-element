/**
 * Checks if the mutations are relevant by checking
 * if there are nodes added, nodes removes or
 * has the class attribute modified.
 * 
 * @param 	{MutationRecord[]} mutations 
 * @returns	{boolean}
 */
const hasRelevantMutations = (mutations: MutationRecord[]) => 
	mutations.filter(({ attributeName, addedNodes, removedNodes }) => 
		attributeName === 'class' ||
		addedNodes.length ||
		removedNodes.length
	).length > 0;

export default hasRelevantMutations