// @flow
import * as React from 'react';
import { FormField, FormFieldPrice } from 'component/common/form';
import * as settings from 'constants/settings';
import * as icons from 'constants/icons';
import Button from 'component/button';
import Page from 'component/page';
import FileSelector from 'component/common/file-selector';

export type Price = {
  currency: string,
  amount: number,
};

type DaemonSettings = {
  download_directory: string,
  disable_max_key_fee: boolean,
  share_usage_data: boolean,
};

type Props = {
  setDaemonSetting: (string, boolean | string | Price) => void,
  setClientSetting: (string, boolean | string | Price) => void,
  clearCache: () => Promise<any>,
  getThemes: () => void,
  daemonSettings: DaemonSettings,
  showNsfw: boolean,
  instantPurchaseEnabled: boolean,
  instantPurchaseMax: Price,
  showUnavailable: boolean,
  currentTheme: string,
  themes: Array<string>,
  automaticDarkModeEnabled: boolean,
  autoplay: boolean,
};

type State = {
  clearingCache: boolean,
};

class SettingsPage extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      clearingCache: false,
    };

    (this: any).onDownloadDirChange = this.onDownloadDirChange.bind(this);
    (this: any).onKeyFeeChange = this.onKeyFeeChange.bind(this);
    (this: any).onInstantPurchaseMaxChange = this.onInstantPurchaseMaxChange.bind(this);
    (this: any).onShowNsfwChange = this.onShowNsfwChange.bind(this);
    (this: any).onShowUnavailableChange = this.onShowUnavailableChange.bind(this);
    (this: any).onShareDataChange = this.onShareDataChange.bind(this);
    (this: any).onThemeChange = this.onThemeChange.bind(this);
    (this: any).onAutomaticDarkModeChange = this.onAutomaticDarkModeChange.bind(this);
    (this: any).onAutoplayChange = this.onAutoplayChange.bind(this);
    (this: any).clearCache = this.clearCache.bind(this);
    // (this: any).onLanguageChange = this.onLanguageChange.bind(this)
  }

  componentDidMount() {
    this.props.getThemes();
  }

  onRunOnStartChange(event: SyntheticInputEvent<*>) {
    this.setDaemonSetting('run_on_startup', event.target.checked);
  }

  onShareDataChange(event: SyntheticInputEvent<*>) {
    this.setDaemonSetting('share_usage_data', event.target.checked);
  }

  onDownloadDirChange(newDirectory: string) {
    this.setDaemonSetting('download_directory', newDirectory);
  }

  onKeyFeeChange(newValue: Price) {
    this.setDaemonSetting('max_key_fee', newValue);
  }

  onKeyFeeDisableChange(isDisabled: boolean) {
    this.setDaemonSetting('disable_max_key_fee', isDisabled);
  }

  onThemeChange(event: SyntheticInputEvent<*>) {
    const { value } = event.target;

    if (value === 'dark') {
      this.onAutomaticDarkModeChange(false);
    }

    this.props.setClientSetting(settings.THEME, value);
  }

  onAutomaticDarkModeChange(value: boolean) {
    this.props.setClientSetting(settings.AUTOMATIC_DARK_MODE_ENABLED, value);
  }

  onAutoplayChange(event: SyntheticInputEvent<*>) {
    this.props.setClientSetting(settings.AUTOPLAY, event.target.checked);
  }

  onInstantPurchaseEnabledChange(enabled: boolean) {
    this.props.setClientSetting(settings.INSTANT_PURCHASE_ENABLED, enabled);
  }

  onInstantPurchaseMaxChange(newValue: Price) {
    this.props.setClientSetting(settings.INSTANT_PURCHASE_MAX, newValue);
  }

  onShowNsfwChange(event: SyntheticInputEvent<*>) {
    this.props.setClientSetting(settings.SHOW_NSFW, event.target.checked);
  }

  onShowUnavailableChange(event: SyntheticInputEvent<*>) {
    this.props.setClientSetting(settings.SHOW_UNAVAILABLE, event.target.checked);
  }

  setDaemonSetting(name: string, value: boolean | string | Price) {
    this.props.setDaemonSetting(name, value);
  }

  clearCache() {
    this.setState({
      clearingCache: true,
    });
    const success = () => {
      this.setState({ clearingCache: false });
      window.location.href = 'index.html';
    };
    const clear = () => this.props.clearCache().then(success);

    setTimeout(clear, 1000, { once: true });
  }

  render() {
    const {
      daemonSettings,
      showNsfw,
      instantPurchaseEnabled,
      instantPurchaseMax,
      showUnavailable,
      currentTheme,
      themes,
      automaticDarkModeEnabled,
      autoplay,
    } = this.props;

    const noDaemonSettings = !daemonSettings || Object.keys(daemonSettings).length === 0;
    const isDarkModeEnabled = currentTheme === 'dark';

    return (
      <Page>
        {noDaemonSettings ? (
          <section className="card card--section">
            <div className="card__title">{__('Failed to load settings.')}</div>
          </section>
        ) : (
          <React.Fragment>
            <section className="card card--section">
              <div className="card__title">{__('Download Directory')}</div>
              <span className="card__subtitle">{__('LBRY downloads will be saved here.')}</span>
              <FileSelector
                type="openDirectory"
                currentPath={daemonSettings.download_directory}
                onFileChosen={this.onDownloadDirChange}
              />
            </section>
            <section className="card card--section">
              <div className="card__title">{__('Max Purchase Price')}</div>
              <span className="card__subtitle">
                {__(
                  'This will prevent you from purchasing any content over a certain cost, as a safety measure.'
                )}
              </span>
              <div className="card__content">
                <FormField
                  type="radio"
                  name="no_max_purchase_limit"
                  checked={daemonSettings.disable_max_key_fee}
                  postfix={__('No Limit')}
                  onChange={() => {
                    this.onKeyFeeDisableChange(true);
                  }}
                />
                <FormField
                  type="radio"
                  name="max_purchase_limit"
                  onChange={() => {
                    this.onKeyFeeDisableChange(false);
                  }}
                  checked={!daemonSettings.disable_max_key_fee}
                  postfix={__('Choose limit')}
                />
                {!daemonSettings.disable_max_key_fee && (
                  <FormFieldPrice
                    name="max_key_fee"
                    label="Max purchase price"
                    min={0}
                    onChange={this.onKeyFeeChange}
                    price={
                      daemonSettings.max_key_fee
                        ? daemonSettings.max_key_fee
                        : { currency: 'USD', amount: 50 }
                    }
                  />
                )}
              </div>
            </section>
            <section className="card card--section">
              <div className="card__title">{__('Purchase Confirmations')}</div>
              <div className="card__subtitle">
                {__(
                  "When this option is chosen, LBRY won't ask you to confirm downloads below your chosen price."
                )}
              </div>
              <div className="card__content">
                <FormField
                  type="radio"
                  name="confirm_all_purchases"
                  checked={!instantPurchaseEnabled}
                  postfix={__('Always confirm before purchasing content')}
                  onChange={() => {
                    this.onInstantPurchaseEnabledChange(false);
                  }}
                />
                <FormField
                  type="radio"
                  name="instant_purchases"
                  checked={instantPurchaseEnabled}
                  postfix={__('Only confirm purchases over a certain price')}
                  onChange={() => {
                    this.onInstantPurchaseEnabledChange(true);
                  }}
                />
                {instantPurchaseEnabled && (
                  <FormFieldPrice
                    label={__('Confirmation price')}
                    min={0.1}
                    onChange={this.onInstantPurchaseMaxChange}
                    price={instantPurchaseMax}
                  />
                )}
              </div>
            </section>
            <section className="card card--section">
              <div className="card__title">{__('Content Settings')}</div>
              <FormField
                type="checkbox"
                name="autoplay"
                onChange={this.onAutoplayChange}
                checked={autoplay}
                postfix={__('Autoplay media files')}
              />
              <FormField
                type="checkbox"
                name="show_unavailable"
                onChange={this.onShowUnavailableChange}
                checked={showUnavailable}
                postfix={__('Show unavailable content in search results')}
              />
              <FormField
                type="checkbox"
                name="show_nsfw"
                onChange={this.onShowNsfwChange}
                checked={showNsfw}
                postfix={__('Show NSFW content')}
                helper={__(
                  'NSFW content may include nudity, intense sexuality, profanity, or other adult content. By displaying NSFW content, you are affirming you are of legal age to view mature content in your country or jurisdiction.  '
                )}
              />
            </section>
            <section className="card card--section">
              <div className="card__title">{__('Share Diagnostic Data')}</div>
              <FormField
                type="checkbox"
                name="share_usage_data"
                onChange={this.onShareDataChange}
                checked={daemonSettings.share_usage_data}
                postfix={__(
                  'Help make LBRY better by contributing analytics and diagnostic data about my usage.'
                )}
                helper={__(
                  'You will be ineligible to earn rewards while diagnostics are not being shared.'
                )}
              />
            </section>
            {
              <section className="card card--section">
                <div className="card__title">{__('Theme')}</div>
                <FormField
                  name="theme_select"
                  type="select"
                  onChange={this.onThemeChange}
                  value={currentTheme}
                  disabled={automaticDarkModeEnabled}
                >
                  {themes.map(theme => (
                    <option key={theme} value={theme}>
                      {theme}
                    </option>
                  ))}
                </FormField>
                <FormField
                  type="checkbox"
                  name="automatic_dark_mode"
                  onChange={e => this.onAutomaticDarkModeChange(e.target.checked)}
                  checked={automaticDarkModeEnabled}
                  disabled={isDarkModeEnabled}
                  postfix={__('Automatic dark mode (9pm to 8am)')}
                />
              </section>
            }
            <section className="card card--section">
              <div className="card__title">{__('Application Cache')}</div>
              <span className="card__subtitle">
                {__('This will clear the application cache. Your wallet will not be affected.')}
              </span>
              <div className="card__content">
                <Button
                  button="primary"
                  label={this.state.clearingCache ? __('Clearing') : __('Clear the cache')}
                  icon={icons.ALERT}
                  onClick={this.clearCache}
                  disabled={this.state.clearingCache}
                />
              </div>
            </section>
          </React.Fragment>
        )}
      </Page>
    );
  }
}

export default SettingsPage;
