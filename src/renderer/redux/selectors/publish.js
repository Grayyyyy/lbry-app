import { createSelector } from 'reselect';
import { parseURI, selectClaimsById, selectMyClaimsWithoutChannels } from 'lbry-redux';

const selectState = state => state.publish || {};

export const selectPendingPublishes = createSelector(
  selectState,
  state => state.pendingPublishes.map(pendingClaim => ({ ...pendingClaim, pending: true })) || []
);

export const selectClaimsWithPendingPublishes = createSelector(
  selectMyClaimsWithoutChannels,
  selectPendingPublishes,
  (claims, pendingPublishes) => {
    // ensure there are no duplicates, they are being checked for in a setInterval
    // no need to wait for it to complete though
    // loop through myclaims
    // if a claim has the same name as one in pendingPublish, remove it from pending
    const claimMap = {};
    claims.forEach(claim => {
      claimMap[claim.name] = true;
    });

    const filteredPendingPublishes = pendingPublishes.filter(claim => !claimMap[claim.name]);
    return [...claims, ...filteredPendingPublishes];
  }
);

export const selectPublishFormValues = createSelector(selectState, state => {
  const { pendingPublish, ...formValues } = state;
  return formValues;
});

export const selectPendingPublish = uri =>
  createSelector(selectPendingPublishes, pendingPublishes => {
    const { claimName, contentName } = parseURI(uri);

    if (!pendingPublishes.length) {
      return null;
    }

    return pendingPublishes.filter(
      publish => (publish.name === claimName || publish.name === contentName) && !publish.isEdit
    )[0];
  });

// Is the current uri the same as the uri they clicked "edit" on
export const selectIsStillEditing = createSelector(selectPublishFormValues, publishState => {
  const { editingURI, uri } = publishState;

  const {
    isChannel: currentIsChannel,
    claimName: currentClaimName,
    contentName: currentContentName,
  } = parseURI(uri);
  const {
    isChannel: editIsChannel,
    claimName: editClaimName,
    contentName: editContentName,
  } = parseURI(editingURI);

  // Depending on the previous/current use of a channel, we need to compare different things
  // ex: going from a channel to anonymous, the new uri won't return contentName, so we need to use claimName
  const currentName = currentIsChannel ? currentContentName : currentClaimName;
  const editName = editIsChannel ? editContentName : editClaimName;
  return currentName === editName;
});

export const selectMyClaimForUri = createSelector(
  selectPublishFormValues,
  selectIsStillEditing,
  selectClaimsById,
  selectMyClaimsWithoutChannels,
  ({ editingURI, uri }, isStillEditing, claimsById, myClaims) => {
    const { contentName, claimName } = parseURI(uri);
    const { claimId: editClaimId } = parseURI(editingURI);

    // If isStillEditing
    // They clicked "edit" from the file page
    // They haven't changed the channel/name after clicking edit
    // Get the claim so they can edit without re-uploading a new file
    return isStillEditing
      ? claimsById[editClaimId]
      : myClaims.find(
          claim =>
            !contentName
              ? claim.name === claimName
              : claim.name === contentName || claim.name === claimName
        );
  }
);
