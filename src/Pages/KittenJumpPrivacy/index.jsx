import { useEffect } from "react";
import "./kittenJumpPrivacy.scss";

const privacyEmail = "dakota.w.brown@silvercastledigital.com";

function KittenJumpPrivacy() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "KJR: Take To The Sky Privacy Policy | Silver Castle Digital";
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <main className="privacy-page" id="main">
      <header className="privacy-hero">
        <div className="privacy-shell">
          <p className="eyebrow">KJR: Take To The Sky</p>
          <h1>Privacy policy</h1>
          <p className="privacy-updated">Last updated September 20, 2026</p>
          <p className="privacy-lead">
            SilverCastle Digital provides KJR: Take To The Sky (the “game”). This policy describes the Android game&apos;s handling of information, including privacy controls introduced with internal-test revision 3. For privacy questions, contact <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>.
          </p>
        </div>
      </header>

      <div className="privacy-shell privacy-content">
        <aside className="privacy-notice" aria-label="Release status">
          <strong>Internal-test revision 3</strong>
          <p>Earlier installed versions may not include the revision 3 privacy controls described here; update through the internal test program to receive them.</p>
        </aside>

        <section>
          <h2>Game progress and customized kittens</h2>
          <p>The game stores progress, settings, customized kitten designs and kitten-use unlocks locally on your device. The current version does not provide game accounts, cloud synchronization or online leaderboards. Your device&apos;s backup and transfer services may separately copy app data according to your device settings and their own policies.</p>
          <p>You can choose to export and share a kitten seed. Anyone you share it with can import that design. Sharing a seed does not transfer your Google Play purchase or your device&apos;s rewarded-ad unlock. Avoid including private information when sharing designs or contacting support.</p>
        </section>

        <section>
          <h2>Purchases</h2>
          <p>Android purchases are processed through Google Play. The game uses Unity In-App Purchasing and Google Play Billing to obtain transaction and ownership information needed to provide, verify and restore Ad-Free. Purchasing services process information under their own policies. The game does not provide a form for entering payment-card details; payment details are handled by Google Play.</p>
          <p>Purchases and advertising consent are separate. Buying Ad-Free removes advertising from the game, but does not delete transaction records held by purchasing providers.</p>
        </section>

        <section>
          <h2>Advertising and privacy choices</h2>
          <p>The game includes optional rewarded-video offers and advertising between eligible runs. Advertising is provided through Unity LevelPlay, currently with the ironSource advertising network enabled. The Unity Ads SDK is included in the app but its advertising network is not currently enabled in the mediation configuration. When advertising services are used, they may collect or share device identifiers, approximate location, ad interactions and technical information. Diagnostics may also be collected. These services use information for ad delivery and measurement, analytics, security and fraud prevention. Approximate location can be inferred from an IP address; this is different from precise GPS location.</p>
          <p>For players who select 18 or older, the game uses Google&apos;s User Messaging Platform to check applicable advertising privacy requirements and present required notices and choices. Advertising remains unavailable if the app&apos;s privacy configuration or eligibility check does not permit it. The game checks consent information on launch rather than treating a previous choice as permanent permission.</p>
          <p>Open <strong>Settings → Privacy choices &amp; policy</strong> to view your age range, open this policy, and access applicable advertising privacy choices. Depending on the privacy service&apos;s requirements, the control may offer to review choices or retry a privacy check. Applicable consent choices can be revisited. The game also applies a conservative sale/sharing opt-out signal to its supported advertising providers; providers handle that signal under their own policies.</p>
          <p>Rejecting personalized advertising does not itself require buying Ad-Free, and permission to request an ad is not treated as permission for every form of personalized advertising. Ad availability depends on privacy eligibility, connectivity and provider availability. Saving and editing a kitten remain free when videos are unavailable. Choosing an age range does not grant an Ad-Free purchase or a rewarded-video unlock.</p>
          <h3>Provider information</h3>
          <ul>
            <li><a href="https://unity.com/legal/privacy-policy" target="_blank" rel="noreferrer">Unity privacy policies for game players and app users <span aria-hidden="true">↗</span></a></li>
            <li><a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Google Privacy Policy <span aria-hidden="true">↗</span></a></li>
          </ul>
          <p>These providers may process information in countries other than where you live. Their policies describe their processing, retention, international-transfer protections and available privacy-request channels.</p>
        </section>

        <section>
          <h2>Age ranges and younger players</h2>
          <p>The game is not specifically directed at children. However, younger people may play it. Revision 3 asks for a broad age range: under 13, 13–15, 16–17, or 18 or older. You can also choose not to provide a range. The selected range is stored locally on your device. We do not ask for your birthday or identity documents through this screen; it is a self-reported preference, not identity or age verification.</p>
          <p>In this version, players in any under-18 range, and players with no age range provided, do not start the game&apos;s advertising SDK. Distinct younger-player ranges are retained, but advertising for those ranges is not enabled yet. This restriction does not grant free purchased content or an ad-based kitten-use unlock. Saved kittens remain available to save, edit and share, and the game&apos;s existing free gameplay remains available.</p>
          <p>You can correct your age range in Privacy settings. If the advertising SDK has already started during the current session, the game saves the correction, stops making new game ad requests and asks you to close and reopen the app. Changing the setting cannot undo information already processed or unload an SDK that has already started. Fully close and reopen the app to apply the new age treatment from startup.</p>
          <p>This version does not offer a parental-consent system. Before advertising is enabled for younger players, the game&apos;s provider settings, permission handling and disclosures must be updated. A parent or guardian with a concern about a child&apos;s information can contact us using the email above. Please do not send identity documents or a child&apos;s full date of birth in an initial email.</p>
        </section>

        <section>
          <h2>Contacting us</h2>
          <p>If you email us, we receive your email address and the information you choose to include. We use this information to respond, investigate the reported issue and handle privacy requests. Please send only information relevant to your request. We do not need your Google password or payment-card number.</p>
        </section>

        <section>
          <h2>Retention and deletion</h2>
          <p>Local game data remains on your device until removed or replaced. Clearing the game&apos;s app storage can permanently remove local progress, saved kittens and local preferences; separately retained device backups may remain. Removing local data does not cancel a purchase or erase records held by Google or Unity.</p>
          <p>We retain support correspondence only as needed to handle the request, maintain necessary support records and meet applicable legal obligations. Service providers maintain their own records under their policies; we cannot promise to erase records outside our control.</p>
        </section>

        <section>
          <h2>Privacy requests</h2>
          <p>Depending on your location and applicable law, you may have rights to request access, correction, deletion or a copy of personal information, or to object to or restrict certain processing. Contact us to make a request or raise a concern. We may request proportionate information to verify the request. We will explain if we do not hold the information or if a provider must handle the request directly. Where applicable, you may also complain to your local data-protection authority.</p>
          <a className="privacy-contact" href={`mailto:${privacyEmail}`}>Contact SilverCastle Digital <span aria-hidden="true">↗</span></a>
        </section>

        <section>
          <h2>Changes to this policy</h2>
          <p>We will update this policy when information practices change. The date above identifies the latest revision. New features such as cloud sync, accounts, leaderboards or advertising for additional age groups require updated disclosures before release. Earlier installed versions may not include the revision 3 privacy controls described here; update through the internal test program to receive them.</p>
        </section>
      </div>
    </main>
  );
}

export default KittenJumpPrivacy;
