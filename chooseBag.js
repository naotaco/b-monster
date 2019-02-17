function chooseBag(availableBagIds, preferences) {
  if (!preferences) {
    return availableBagIds[0];
  }

  return availableBagIds.reduce((previous, current) => {
    const previousIndex = preferences.indexOf(previous)
    const currentIndex = preferences.indexOf(current)

    if (currentIndex === -1) {
      return previous;
    }

    // 低いほうが優先度が高い
    return previousIndex > currentIndex ? current : previous;
  });
}

module.exports = chooseBag;
