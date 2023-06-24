
// Function to store user details in local storage
export function storeUserDetails(userDetails: any): void {
    const userDetailsJSON = JSON.stringify(userDetails);
    localStorage.setItem('userDetails', userDetailsJSON);
  }
  
// Function to retrieve user details from local storage
export function getUserDetails(): any {
  const userDetailsJSON = localStorage.getItem('userDetails');

  if (userDetailsJSON !== null) {
    const userDetails = JSON.parse(userDetailsJSON);
    return userDetails;
  }

  return null;
}

  
  // Function to remove user details from local storage
  export function removeUserDetails(): void {
    localStorage.removeItem('userDetails');
  }
  