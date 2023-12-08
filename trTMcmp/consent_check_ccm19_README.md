# consent_check_ccm19.js - Library item for CMP ccm19
*consent_check_ccm19.js 1.0 | Last update to this document: 06.12.2023*

## What is it for? - General Information

CCM19 is a CMP programmed and hosted in Germany. It basically works without TCP and vendors. Vendors are only supported if TCP is explicitly activated in the CCM19 settings.
This script uses the version without TCP.

Errors and messages are only saved as IDs in the logs. In order to read these, the debug JavaScript must be loaded.
For more information - including about the library itself - please read the README.md in the main directory.

## Process

### Check Action

The first step is to check whether the “action” is executed correctly. If it is not a string or the string is not set to "init" or "update", the script is aborted and a corresponding message is placed in the log.

```
trTM.f.consent_check called, but action argument (a) is not valid
```

### Create return object

The object will later be passed to the main script. At the beginning 'hasResponse' is set to 'false' and 'feedback' is created as an empty property.
During the course of the process - if everything goes correctly - the services that have been agreed to will be added.

### Check whether response was already given
If 'hasResponse' has already been filled elsewhere, the script stops processing at this point.

### Check the CCM19 instance
If the JavaScript object of CCM19 (CCM) does not exist or is not an object or its object property 'consent' is not a Boolean, the script exits here too.
The property 'consent' contains whether the user pressed the save button. However, this does not make any statement about approved or rejected services.
If everything is OK, 'ccm19' will be created as a new object containing the CCM object.

### Check if user consent is available and required
The property 'consentRequired' indicates whether consent is generally required.
If it is required and consent has not yet been given, the script ends at this point.

### Get Services Consent data
First, an empty object (array) is created for the services.

### Sort Service Array and stringify it


### Build feedback

### Get some more info about how consent was given, if available


### Get Consent ID

### Set Response


### Callback and Return


This is a test. hlholbnjlpbhnjhpöhnbhnpöhnpöki