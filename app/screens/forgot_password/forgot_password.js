// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import Button from 'react-native-button';
import {Navigation} from 'react-native-navigation';
import {intlShape} from 'react-intl';

import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
    Appearance,
} from 'react-native';

import {isEmail} from '@mm-redux/utils/helpers';

import {GlobalStyles} from 'app/styles';

import ErrorText from 'app/components/error_text';
import FormattedText from 'app/components/formatted_text';
import StatusBar from 'app/components/status_bar';

import {
    getButtonStyle,
    getButtonTextStyle,
    getColorStyles,
    getInputStyle,
    getLogo,
    getStyledNavigationOptions,
} from 'app/utils/appearance';

import EphemeralStore from 'app/store/ephemeral_store';

export default class ForgotPassword extends PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            sendPasswordResetEmail: PropTypes.func.isRequired,
        }),
    }

    static contextTypes = {
        intl: intlShape.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            colorStyles: getColorStyles(Appearance.getColorScheme()),
            error: null,
            email: '',
            logo: getLogo(Appearance.getColorScheme()),
            sentPasswordLink: false,
        };
    }

    componentDidMount() {
        this.appearanceEventListener = Appearance.addChangeListener(({colorScheme}) => {
            const colorStyles = getColorStyles(colorScheme);
            this.setState({
                colorStyles,
                logo: getLogo(colorScheme),
            });

            Navigation.mergeOptions(EphemeralStore.getNavigationTopComponentId(), getStyledNavigationOptions(colorStyles));
        });
    }

    componentWillUnmount() {
        this.appearanceEventListener.remove();
    }

    changeEmail = (email) => {
        this.setState({
            email,
        });
    }

    submitResetPassword = async () => {
        if (!this.state.email || !isEmail(this.state.email)) {
            const {formatMessage} = this.context.intl;
            this.setState({
                error: formatMessage({id: 'password_send.error', defaultMessage: 'Please enter a valid email address.'}),
            });
            return;
        }

        const {data, error} = await this.props.actions.sendPasswordResetEmail(this.state.email);
        if (error) {
            this.setState({error});
        } else if (this.state.error) {
            this.setState({error: ''});
        }
        if (data) {
            this.setState({sentPasswordLink: true});
        }
    }

    emailIdRef = (ref) => {
        this.emailId = ref;
    };

    blur = () => {
        if (this.emailId) {
            this.emailId.blur();
        }
    }

    isResetButtonDisabled = () => {
        return !this.state.email;
    }

    setFocusStyle() {
        this.emailId.setNativeProps({style: [GlobalStyles.inputBoxFocused, this.state.colorStyles.inputBoxFocused]});
    }

    setBlurStyle() {
        if (!this.isResetButtonDisabled()) {
            this.emailId.setNativeProps({style: [GlobalStyles.inputBoxBlur, this.state.colorStyles.inputBox]});
        }
    }

    render() {
        const {colorStyles, error, logo} = this.state;
        const {formatMessage} = this.context.intl;
        let displayError;
        if (this.state.error) {
            displayError = (
                <ErrorText
                    error={this.state.error}
                    textStyle={style.errorText}
                />
            );
        }

        let passwordFormView;
        if (this.state.sentPasswordLink) {
            passwordFormView = (
                <View style={style.resetSuccessContainer}>
                    <FormattedText
                        style={style.successTxtColor}
                        id='password_send.link'
                        defaultMessage='If the account exists, a password reset email will be sent to:'
                    />
                    <Text style={[style.successTxtColor, style.emailId]}>
                        {this.state.email}
                    </Text>
                    <FormattedText
                        style={[style.successTxtColor, style.defaultTopPadding]}
                        id='password_send.checkInbox'
                        defaultMessage='Please check your inbox.'
                    />
                </View>
            );
        } else {
            passwordFormView = (
                <View>
                    <FormattedText
                        style={[GlobalStyles.subheader, colorStyles.header, {marginTop: 32}]}
                        id='password_send.description'
                        defaultMessage='To reset your password, enter the email address you used to sign up'
                    />
                    <TextInput
                        ref={this.emailIdRef}
                        onBlur={this.setBlurStyle.bind(this)}
                        onChangeText={this.changeEmail}
                        onFocus={this.setFocusStyle.bind(this)}
                        style={getInputStyle(false, error, colorStyles, error ? {} : {marginBottom: 16})}
                        placeholder={formatMessage({id: 'login.email', defaultMessage: 'Email'})}
                        placeholderTextColor={colorStyles.inputBoxDisabled.color}
                        autoCorrect={false}
                        autoCapitalize='none'
                        keyboardType='email-address'
                        underlineColorAndroid='transparent'
                        blurOnSubmit={false}
                        disableFullscreenUI={true}
                    />
                    {displayError}
                    <Button
                        containerStyle={getButtonStyle(this.isResetButtonDisabled(), colorStyles, error ? {marginTop: 12} : {})}
                        disabled={this.isResetButtonDisabled()}
                        onPress={this.submitResetPassword}
                    >
                        <FormattedText
                            id='password_send.reset'
                            defaultMessage='Reset my password'
                            style={getButtonTextStyle(this.isResetButtonDisabled(), colorStyles)}
                        />
                    </Button>
                </View>
            );
        }
        return (
            <View style={[GlobalStyles.container, colorStyles.container]}>
                <StatusBar/>
                <TouchableWithoutFeedback
                    onPress={this.blur}
                >
                    <View style={GlobalStyles.innerContainer}>
                        <Image
                            source={logo}
                        />
                        {passwordFormView}
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}

const style = StyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingHorizontal: 15,
        paddingVertical: 50,
    },
    errorText: {
        width: '100%',
    },
    forgotPasswordBtn: {
        borderColor: 'transparent',
        marginTop: 15,
    },
    resetSuccessContainer: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#dff0d8',
        borderColor: '#d6e9c6',
    },
    emailId: {
        fontWeight: 'bold',
    },
    successTxtColor: {
        color: '#3c763d',
    },
    defaultTopPadding: {
        paddingTop: 15,
    },
});
