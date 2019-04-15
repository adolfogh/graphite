import { getGlobal, setGlobal } from 'reactn';
import { ToastsStore} from 'react-toasts';
import { getMonthDayYear } from '../../shared/helpers/getMonthDayYear';
import { postData } from '../../shared/helpers/post';
import { saveDoc } from './singleDoc';
const wordCount = require('html-word-count');

export function sharePublicly(params) {
    let singleDoc = getGlobal().singleDoc;
    if (singleDoc.readOnly === undefined) {
      setGlobal({ readOnly: true }, async () => {
        const object = {
          title: getGlobal().title,
          content: document.getElementsByClassName("editor")[0].innerHTML, 
          readOnly: true,
          words: wordCount(
            document
              .getElementsByClassName("editor")[0]
              .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
          ), 
          shared: getMonthDayYear(), 
          singleDocIsPublic: true
        };
        singleDoc["singleDocIsPublic"] = true;
        setGlobal(
          {
            singlePublic: object,
            singleDoc: singleDoc
          },
          () => {
            savePublic();
          }
        );
      });
    } else {
      const object = {};
      object.title = getGlobal().title;
      if (singleDoc.readOnly) {
        object.content = document.getElementsByClassName("editor")[0].innerHTML;
      } else {
        let content = getGlobal().content;
        object.content = content.toJSON();
      }
      object.readOnly = singleDoc.readOnly;
      object.words = wordCount(
        document
          .getElementsByClassName("editor")[0]
          .innerHTML.replace(/<(?:.|\n)*?>/gm, "")
      );
      object.shared = getMonthDayYear();
      object.singleDocIsPublic = true;
      singleDoc["singleDocIsPublic"] = true;
      setGlobal(
        {
          singlePublic: object,
          singleDoc: singleDoc
        },
        () => {
          savePublic();
        }
      );
    }
    if(params) {
      saveDoc(params)
    } else {
      saveDoc({singleDocIsPublic: true})
    }
  }

  export async function savePublic() {
    const { userSession } = getGlobal();
    const user = userSession.loadUserData().username;
    let id;
    window.location.href.includes("new") ? id = window.location.href.split("new/")[1] : id = window.location.href.split("documents/")[1];
    const directory = "public/";
    const file = directory + id + ".json";
    const link = `${window.location.origin}/shared/docs/${user}-${id}`;

    try {
        let pubDocParams = {
            fileName: file, 
            body: JSON.stringify(getGlobal().singlePublic), 
            encrypt: false
        }
        const publicDoc = await postData(pubDocParams);
        console.log(publicDoc);
        setGlobal({ gaiaLink: link});
        ToastsStore.success(`Document shared publicly`)
      } catch(error) {
        console.log(error)
      }
  }

  export function toggleReadOnly() {
    //make this function toggleReadyOnly state instead, so user can press button again
    setGlobal({readOnly: !getGlobal().readOnly}, () => {
      let params = {
        singleDocIsPublic: true, 
        readOnly: getGlobal().readOnly
      }
      sharePublicly(params);
    })
  }