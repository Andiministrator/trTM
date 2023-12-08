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
A check is then carried out to see whether the CMP object and its property 'acceptedEmbeddings' have the correct type and are not 'null'.
The property, which is an array, is then processed item by item. If the value for 'name' is a string and not empty, it will be entered into the previously created service array. All existing commas are removed because in the later check in the Tag Manager the strings to be checked are checked in the format ',SERVICE,'. This is so that the service can actually be found.
Examples:
It checks whether 'Google' is included
',Google, Ireland,' && ',Google,' both are found
It checks whether 'Google' is included
',Google, Ireland,' && ',Google,' only the first value is found

### Sort Service Array and stringify it
If at least one service is included, they will be sorted alphabetically first. This has no influence on the programming itself. However, if you want to look at the services on the console and the number is high, it is easier to find a specific service.
Now the array is converted into a string, which separates the services with a comma and adds a final comma at the end of the string.

### Build feedback
The 'feedback' property is assigned a default value.

### Get some more info about how consent was given, if available
The CCM object has a property that provides information about whether all services have been approved or only some. By the way, the services that are always necessary are also counted. That's why the messages never say that all services have been refused.

### Get Consent ID
In order to view the history of consent or send it to the responsible website operator, you need the Consent ID. This is saved in the CMP object under 'ucid' and passed to the script in this step. Dies ist in einigen speziellen Fällen notwendig, um auswerten zu können, wann der User einen Service an- oder abgewählt hat. Dies hat nichts mit der User ID zu tun, welche in den tag Managern gespeichert werden kann.

### Set Response
Now the response 'o.hasResponse' is set to 'true', which indicates to the main script that the consent status was successfully recorded and processed.

### Callback and Return
All data is then passed to the main script and the success is logged.